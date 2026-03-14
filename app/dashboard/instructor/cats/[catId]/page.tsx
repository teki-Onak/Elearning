'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, X, Check, Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react'

type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'

export default function CATQuestionsPage() {
  const { catId } = useParams()
  const router = useRouter()
  const [cat, setCat] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    text: '',
    type: 'MCQ' as QuestionType,
    options: ['', '', '', ''],
    answer: '',
    marks: 1,
  })

  const fetchData = async () => {
    setLoading(true)
    const [catRes, qRes] = await Promise.all([
      fetch(`/api/instructor/cats/${catId}`),
      fetch(`/api/instructor/cats/${catId}/questions`),
    ])
    const [catData, qData] = await Promise.all([catRes.json(), qRes.json()])
    setCat(catData)
    setQuestions(Array.isArray(qData) ? qData : [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [catId])

  const handleSave = async () => {
    if (!form.text || !form.answer) return setError('Question text and answer are required')
    if (form.type === 'MCQ' && form.options.some(o => !o.trim())) return setError('All MCQ options must be filled')
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/instructor/cats/${catId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          options: form.type === 'MCQ' ? form.options : form.type === 'TRUE_FALSE' ? ['True', 'False'] : [],
        }),
      })
      if (!res.ok) throw new Error('Failed to save question')
      setShowModal(false)
      setForm({ text: '', type: 'MCQ', options: ['', '', '', ''], answer: '', marks: 1 })
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    await fetch(`/api/instructor/cats/${catId}/questions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId }),
    })
    fetchData()
  }

  const handlePublish = async () => {
    setPublishing(true)
    await fetch(`/api/instructor/cats/${catId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !cat.isPublished }),
    })
    fetchData()
    setPublishing(false)
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-white">{cat?.title}</h1>
          <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-400">
            <span>{cat?.duration} mins</span>
            <span>·</span>
            <span>{cat?.totalMarks} total marks</span>
            <span>·</span>
            <span>{questions.length} questions ({totalMarks} marks added)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              cat?.isPublished
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : cat?.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {cat?.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button onClick={() => { setShowModal(true); setError('') }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* CAT Info Card */}
      <div className="card border border-primary-500/20 bg-primary-500/5">
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Duration', value: `${cat?.duration} mins` },
            { label: 'Total Marks', value: cat?.totalMarks },
            { label: 'Pass Mark', value: `${cat?.passMark}%` },
            { label: 'Questions', value: questions.length },
          ].map(s => (
            <div key={s.label}>
              <div className="text-white font-bold text-lg">{s.value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="card text-center py-16">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No questions yet</p>
          <p className="text-slate-400 text-sm">Add questions to this CAT.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  <span className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-white font-medium">{q.text}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{q.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                    </div>
                    {q.type !== 'SHORT_ANSWER' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt: string, j: number) => (
                          <div key={j} className={`px-3 py-2 rounded-lg text-sm ${opt === q.answer ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                            {opt === q.answer && <span className="mr-1">✓</span>}{opt}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'SHORT_ANSWER' && (
                      <p className="text-sm text-emerald-400 mt-1">Expected: {q.answer}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="font-display text-lg font-bold text-white">Add Question</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Question Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'] as QuestionType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t, answer: '', options: ['', '', '', ''] })}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${form.type === t ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      {t === 'TRUE_FALSE' ? 'True/False' : t === 'SHORT_ANSWER' ? 'Short Answer' : 'MCQ'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Question Text *</label>
                <textarea
                  className="input w-full h-24 resize-none"
                  placeholder="Write your question here..."
                  value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                />
              </div>

              {form.type === 'MCQ' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Options *</label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm w-6">{String.fromCharCode(65 + i)}.</span>
                        <input
                          className="input flex-1"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          value={opt}
                          onChange={e => {
                            const opts = [...form.options]
                            opts[i] = e.target.value
                            setForm({ ...form, options: opts })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm text-slate-400 mb-1.5">Correct Answer *</label>
                    <select className="input w-full" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })}>
                      <option value="">Select correct answer</option>
                      {form.options.filter(o => o.trim()).map((opt, i) => (
                        <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {form.type === 'TRUE_FALSE' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Correct Answer *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map(v => (
                      <button
                        key={v}
                        onClick={() => setForm({ ...form, answer: v })}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${form.answer === v ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.type === 'SHORT_ANSWER' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Expected Answer *</label>
                  <input className="input w-full" placeholder="Expected answer..." value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} />
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Marks</label>
                <input type="number" min={1} className="input w-full" value={form.marks} onChange={e => setForm({ ...form, marks: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
