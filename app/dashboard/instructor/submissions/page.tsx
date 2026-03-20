export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Loader2, X, Check, BookOpen, User } from 'lucide-react'

export default function InstructorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gradeModal, setGradeModal] = useState<any | null>(null)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchSubmissions = async () => {
    setLoading(true)
    const res = await fetch('/api/instructor/submissions')
    const data = await res.json()
    setSubmissions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchSubmissions() }, [])

  const handleGrade = async () => {
    if (!grade) return
    setSaving(true)
    try {
      const res = await fetch('/api/instructor/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: gradeModal.id,
          grade: Number(grade),
          feedback,
        }),
      })
      if (res.ok) {
        setGradeModal(null)
        setGrade('')
        setFeedback('')
        fetchSubmissions()
      }
    } finally {
      setSaving(false)
    }
  }

  const filtered = submissions.filter(s => {
    if (filter === 'graded') return s.grade !== null
    if (filter === 'pending') return s.grade === null
    return true
  })

  const pending = submissions.filter(s => s.grade === null).length
  const graded = submissions.filter(s => s.grade !== null).length

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Submissions</h1>
        <p className="text-slate-400 mt-1">Review and grade student assignment submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: submissions.length, color: 'text-white' },
          { label: 'Pending', value: pending, color: 'text-amber-400' },
          { label: 'Graded', value: graded, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'graded', label: 'Graded' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20">
          <CheckCircle className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No submissions yet</h2>
          <p className="text-slate-400 text-sm">Student submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(s => (
            <div key={s.id} className={`card border ${s.grade !== null ? 'border-emerald-800/40' : 'border-amber-800/40'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-white">{s.assignment?.title}</h3>
                    {s.grade !== null
                      ? <span className="badge text-xs badge-success">Graded</span>
                      : <span className="badge text-xs badge-warning">Pending</span>
                    }
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />{s.student?.name}
                    </span>
                    <span className="text-slate-500">{s.student?.email}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(s.submittedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-sm text-slate-300 line-clamp-3">
                    {s.content}
                  </div>
                  {s.grade !== null && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-emerald-400 font-medium text-sm">
                        Grade: {s.grade}/{s.assignment?.totalMarks}
                      </span>
                      {s.feedback && (
                        <span className="text-slate-400 text-sm">· {s.feedback}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {s.grade === null ? (
                    <button
                      onClick={() => { setGradeModal(s); setGrade(''); setFeedback('') }}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> Grade
                    </button>
                  ) : (
                    <button
                      onClick={() => { setGradeModal(s); setGrade(String(s.grade)); setFeedback(s.feedback || '') }}
                      className="btn-secondary text-sm"
                    >
                      Edit Grade
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade Modal */}
      {gradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Grade Submission</h2>
                <p className="text-slate-400 text-sm mt-0.5">{gradeModal.student?.name} · {gradeModal.assignment?.title}</p>
              </div>
              <button onClick={() => setGradeModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300 max-h-40 overflow-y-auto">
                {gradeModal.content}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Grade * (out of {gradeModal.assignment?.totalMarks})
                </label>
                <input
                  type="number"
                  min={0}
                  max={gradeModal.assignment?.totalMarks}
                  className="input w-full"
                  placeholder={`0 - ${gradeModal.assignment?.totalMarks}`}
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Feedback (optional)</label>
                <textarea
                  className="input w-full h-24 resize-none"
                  placeholder="Write feedback for the student..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setGradeModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleGrade}
                disabled={saving || !grade}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
