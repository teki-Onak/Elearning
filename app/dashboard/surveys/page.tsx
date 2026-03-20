'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { ClipboardList, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSurvey, setActiveSurvey] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/surveys')
      .then(r => r.json())
      .then(data => { setSurveys(data); setLoading(false) })
  }, [])

  const handleSubmit = async () => {
    if (!activeSurvey) return
    const unanswered = activeSurvey.questions.filter((q: any) => !answers[q.id])
    if (unanswered.length > 0) {
      toast.error(`Please answer all ${unanswered.length} remaining questions.`)
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyId: activeSurvey.id, answers }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error)
    } else {
      toast.success('Survey submitted! Thank you for your feedback 🎉')
      setSurveys(prev => prev.map(s => s.id === activeSurvey.id ? { ...s, isCompleted: true } : s))
      setActiveSurvey(null)
      setAnswers({})
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  if (activeSurvey) {
    return (
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <button onClick={() => setActiveSurvey(null)} className="btn-ghost text-sm">← Back to Surveys</button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{activeSurvey.title}</h1>
          {activeSurvey.description && <p className="text-slate-400 mt-1">{activeSurvey.description}</p>}
        </div>

        <div className="space-y-6">
          {activeSurvey.questions.map((q: any, i: number) => (
            <div key={q.id} className="card">
              <p className="text-white font-medium mb-4">
                <span className="text-primary-400 mr-2">{i + 1}.</span>{q.text}
              </p>

              {q.type === 'RATING' && (
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                      className={`flex-1 py-3 rounded-xl border font-semibold transition-all ${
                        answers[q.id] === v
                          ? 'border-primary-500 bg-primary-500/15 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}

              {(q.type === 'MULTIPLE_CHOICE' || q.type === 'YES_NO') && (
                <div className="space-y-2">
                  {(q.type === 'YES_NO' ? ['Yes', 'No'] : q.options).map((opt: string) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        answers[q.id] === opt
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'TEXT' && (
                <textarea
                  value={answers[q.id] ?? ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Your answer..."
                  className="input resize-none h-24"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-400">
            {Object.keys(answers).length} / {activeSurvey.questions.length} answered
          </p>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Submit Survey
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-amber-400" /> Research Surveys
        </h1>
        <p className="text-slate-400 mt-1">
          Your responses help researchers improve online learning for everyone. All responses are anonymous.
        </p>
      </div>

      {surveys.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No active surveys at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey) => (
            <div key={survey.id} className={`card-hover ${survey.isCompleted ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{survey.title}</h3>
                    {survey.isCompleted && <span className="badge-success">Completed</span>}
                  </div>
                  {survey.description && <p className="text-slate-400 text-sm">{survey.description}</p>}
                  <p className="text-xs text-slate-500 mt-2">
                    {survey.questions.length} questions · {survey._count.responses} responses
                  </p>
                </div>
                {!survey.isCompleted && (
                  <button
                    onClick={() => setActiveSurvey(survey)}
                    className="btn-primary text-sm flex items-center gap-1.5 ml-4"
                  >
                    Start <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {survey.isCompleted && <CheckCircle className="w-5 h-5 text-emerald-400 ml-4 flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
