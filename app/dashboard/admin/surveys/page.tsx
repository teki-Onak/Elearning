'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { ClipboardList, Plus, Loader2, Users, BarChart2, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'TEXT', label: 'Descriptive / Text' },
  { value: 'RATING', label: 'Rating (1-5)' },
  { value: 'YES_NO', label: 'Yes / No' },
]

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null)
  const [results, setResults] = useState<any>(null)
  const [loadingResults, setLoadingResults] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<any[]>([
    { text: '', type: 'MULTIPLE_CHOICE', options: ['', ''], category: '' }
  ])

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    const res = await fetch('/api/surveys/admin')
    const data = await res.json()
    setSurveys(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const addQuestion = () => {
    setQuestions(prev => [...prev, { text: '', type: 'MULTIPLE_CHOICE', options: ['', ''], category: '' }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  const addOption = (index: number) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, options: [...q.options, ''] } : q))
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, options: q.options.filter((_: any, oi: number) => oi !== oIndex) } : q))
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, options: q.options.map((o: string, oi: number) => oi === oIndex ? value : o) } : q))
  }

  const handleCreate = async () => {
    if (!title) { toast.error('Title is required'); return }
    if (questions.some(q => !q.text)) { toast.error('All questions must have text'); return }

    setCreating(true)
    const res = await fetch('/api/surveys/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, questions }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success('Survey created!')
      setSurveys(prev => [json, ...prev])
      setTitle('')
      setDescription('')
      setQuestions([{ text: '', type: 'MULTIPLE_CHOICE', options: ['', ''], category: '' }])
      setShowForm(false)
    } else {
      toast.error(json.error || 'Failed to create survey')
    }
    setCreating(false)
  }

  const viewResults = async (survey: any) => {
    setSelectedSurvey(survey)
    setLoadingResults(true)
    const res = await fetch(`/api/surveys/admin/results?surveyId=${survey.id}`)
    const data = await res.json()
    setResults(data)
    setLoadingResults(false)
  }

  const getAnswerSummary = (question: any, responses: any[]) => {
    const answers = responses.map(r => {
      const ans = r.answers as any
      return ans[question.id]
    }).filter(Boolean)

    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'YES_NO' || question.type === 'RATING') {
      const counts: Record<string, number> = {}
      answers.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
      return Object.entries(counts).map(([key, count]) => ({ key, count, percent: Math.round((count / answers.length) * 100) }))
    }
    return answers
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-amber-400" /> Survey Management
          </h1>
          <p className="text-slate-400 mt-1">Create and manage research surveys for students</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Survey
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className="card border-primary-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Create New Survey</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Survey Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Online Learning Experience" className="input" />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description for students..." className="input resize-none h-20" />
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Questions</h3>
            {questions.map((q, qi) => (
              <div key={qi} className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Question {qi + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  value={q.text}
                  onChange={e => updateQuestion(qi, 'text', e.target.value)}
                  placeholder="Enter your question..."
                  className="input"
                />

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="label text-xs">Question Type</label>
                    <select
                      value={q.type}
                      onChange={e => updateQuestion(qi, 'type', e.target.value)}
                      className="input"
                    >
                      {QUESTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="label text-xs">Category (optional)</label>
                    <input
                      value={q.category}
                      onChange={e => updateQuestion(qi, 'category', e.target.value)}
                      placeholder="e.g., Motivation"
                      className="input"
                    />
                  </div>
                </div>

                {q.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    <label className="label text-xs">Options</label>
                    {q.options.map((opt: string, oi: number) => (
                      <div key={oi} className="flex gap-2">
                        <input
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          placeholder={`Option ${oi + 1}`}
                          className="input flex-1"
                        />
                        {q.options.length > 2 && (
                          <button onClick={() => removeOption(qi, oi)} className="text-red-400">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addOption(qi)} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button onClick={addQuestion} className="btn-secondary flex items-center gap-2 w-full justify-center">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={creating} className="btn-primary flex items-center gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Survey
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* RESULTS MODAL */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{selectedSurvey.title} — Results</h2>
              <button onClick={() => { setSelectedSurvey(null); setResults(null) }}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {loadingResults ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : results ? (
              <div className="space-y-6">
                <p className="text-slate-400 text-sm">{results.responses?.length ?? 0} responses total</p>
                {results.survey?.questions?.map((q: any) => {
                  const summary = getAnswerSummary(q, results.responses)
                  return (
                    <div key={q.id} className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                      <p className="font-medium text-white">{q.text}</p>
                      <span className="text-xs text-slate-500">{q.type}</span>

                      {q.type === 'TEXT' ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {(summary as string[]).map((ans, i) => (
                            <p key={i} className="text-sm text-slate-300 bg-slate-700/50 rounded-lg p-2">{ans}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(summary as any[]).map((item, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">{item.key}</span>
                                <span className="text-slate-400">{item.count} ({item.percent}%)</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-primary-500 h-2 rounded-full"
                                  style={{ width: `${item.percent}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* SURVEYS LIST */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No surveys yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{survey.title}</h3>
                    <span className={`badge ${survey.isActive ? 'badge-success' : 'badge-error'}`}>
                      {survey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {survey.description && <p className="text-slate-400 text-sm">{survey.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />{survey.questions?.length ?? 0} questions</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{survey._count?.responses ?? 0} responses</span>
                  </div>
                </div>
                <button onClick={() => viewResults(survey)} className="btn-secondary text-xs flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5" /> View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
