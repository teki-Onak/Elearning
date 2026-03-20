'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, CheckCircle, Loader2, X } from 'lucide-react'

const emptyQuestion = {
  text: '',
  type: 'MCQ',
  options: ['', '', '', ''],
  answer: '',
  marks: 1,
}

export default function ExamQuestionsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyQuestion)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [examTitle, setExamTitle] = useState('')

  const fetchQuestions = async () => {
    setLoading(true)
    const res = await fetch(`/api/instructor/exams/${id}/questions`)
    const data = await res.json()
    setQuestions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const fetchExam = async () => {
    const res = await fetch(`/api/instructor/exams`)
    const data = await res.json()
    const exam = Array.isArray(data) ? data.find((e: any) => e.id === id) : null
    if (exam) setExamTitle(exam.title)
  }

  useEffect(() => {
    fetchQuestions()
    fetchExam()
  }, [id])

  const updateOption = (index: number, value: string) => {
    const opts = [...form.options]
    opts[index] = value
    setForm({ ...form, options: opts })
  }

  const handleSave = async () => {
    setError('')
    if (!form.text.trim()) return setError('Question text is required')
    if (form.type === 'MCQ') {
      if (form.options.some(o => !o.trim())) return setError('All options must be filled')
      if (!form.answer.trim()) return setError('Correct answer is required')
      if (!form.options.includes(form.answer)) return setError('Correct answer must match one of the options exactly')
    }
    if (form.type === 'TRUE_FALSE' && !form.answer) return setError('Select correct answer')
    setSaving(true)
    try {
      const res = await fetch(`/api/instructor/exams/${id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: form.text,
          type: form.type,
          options: form.type === 'MCQ' ? form.options : form.type === 'TRUE_FALSE' ? ['True', 'False'] : [],
          answer: form.answer,
          marks: form.marks,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setShowModal(false)
      setForm(emptyQuestion)
      fetchQuestions()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    await fetch(`/api/instructor/exams/${id}/questions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId }),
    })
    fetchQuestions()
  }

  const totalMarks = questions.reduce((a, q) => a + q.marks, 0)

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/instructor/exams')}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-white">
            {examTitle || 'Exam Questions'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {questions.length} question{questions.length !== 1 ? 's' : ''} · {totalMarks} total marks
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(emptyQuestion); setError('') }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : questions.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">No questions yet</h2>
          <p className="text-slate-400 text-sm mb-6">Start adding questions to this exam.</p>
          <button
            onClick={() => { setShowModal(true); setForm(emptyQuestion); setError('') }}
            className="btn-primary"
          >
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {q.type}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {q.marks} mark{q.marks > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-white font-medium mb-3">{q.text}</p>
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt: string, j: number) => (
                        <div
                          key={j}
                          className={`text-sm px-3 py-2 rounded-lg border ${
                            opt === q.answer
                              ? 'border-emerald-600 bg-emerald-900/20 text-emerald-400'
                              : 'border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className="font-medium mr-1">{String.fromCharCode(65 + j)}.</span>
                          {opt}
                          {opt === q.answer && <CheckCircle className="w-3.5 h-3.5 inline ml-1" />}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'SHORT_ANSWER' && (
                    <div className="text-sm text-emerald-400 mt-2">
                      ✓ Expected: {q.answer}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
                >
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
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Question Type */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Question Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'MCQ', label: 'Multiple Choice' },
                    { key: 'TRUE_FALSE', label: 'True / False' },
                    { key: 'SHORT_ANSWER', label: 'Short Answer' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setForm({ ...form, type: t.key, options: t.key === 'MCQ' ? ['', '', '', ''] : [], answer: '' })}
                      className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        form.type === t.key
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Question *</label>
                <textarea
                  className="input w-full h-24 resize-none"
                  placeholder="Enter your question here..."
                  value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                />
              </div>

              {/* MCQ Options */}
              {form.type === 'MCQ' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Options *</label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm w-5">{String.fromCharCode(65 + i)}.</span>
                        <input
                          className="input flex-1"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          value={opt}
                          onChange={e => updateOption(i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm text-slate-400 mb-1.5">Correct Answer *</label>
                    <select
                      className="input w-full"
                      value={form.answer}
                      onChange={e => setForm({ ...form, answer: e.target.value })}
                    >
                      <option value="">Select correct answer</option>
                      {form.options.filter(o => o.trim()).map((opt, i) => (
                        <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* True/False */}
              {form.type === 'TRUE_FALSE' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Correct Answer *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map(val => (
                      <button
                        key={val}
                        onClick={() => setForm({ ...form, answer: val })}
                        className={`py-3 rounded-xl border font-medium transition-all ${
                          form.answer === val
                            ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Answer */}
              {form.type === 'SHORT_ANSWER' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Expected Answer *</label>
                  <input
                    className="input w-full"
                    placeholder="Enter the expected answer..."
                    value={form.answer}
                    onChange={e => setForm({ ...form, answer: e.target.value })}
                  />
                </div>
              )}

              {/* Marks */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Marks</label>
                <input
                  type="number"
                  min={1}
                  className="input w-full"
                  value={form.marks}
                  onChange={e => setForm({ ...form, marks: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
