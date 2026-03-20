export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Calendar, BookOpen, Loader2, CheckCircle, Clock, Send, X } from 'lucide-react'

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitModal, setSubmitModal] = useState<any | null>(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchAssignments = async () => {
    setLoading(true)
    const res = await fetch('/api/student/assignments')
    const data = await res.json()
    setAssignments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchAssignments() }, [])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: submitModal.id, content }),
      })
      if (res.ok) {
        setSuccess('Assignment submitted successfully!')
        setSubmitModal(null)
        setContent('')
        fetchAssignments()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()

  const isDueSoon = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime()
    return diff > 0 && diff < 48 * 60 * 60 * 1000
  }

  const getTimeLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime()
    if (diff < 0) return 'Overdue'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const typeColors: Record<string, string> = {
    ASSIGNMENT: 'badge-primary',
    PROJECT: 'badge-warning',
    EXAM: 'badge-error',
  }

  const filtered = assignments.filter(a => {
    if (filter === 'pending') return a.submissions.length === 0 && !isOverdue(a.dueDate)
    if (filter === 'submitted') return a.submissions.length > 0
    if (filter === 'overdue') return isOverdue(a.dueDate) && a.submissions.length === 0
    return true
  })

  const pending = assignments.filter(a => a.submissions.length === 0 && !isOverdue(a.dueDate)).length
  const submitted = assignments.filter(a => a.submissions.length > 0).length
  const overdue = assignments.filter(a => isOverdue(a.dueDate) && a.submissions.length === 0).length

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Assignments</h1>
        <p className="text-slate-400 mt-1">View and submit your assignments and projects</p>
      </div>

      {success && (
        <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending, color: 'text-amber-400' },
          { label: 'Submitted', value: submitted, color: 'text-emerald-400' },
          { label: 'Overdue', value: overdue, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'overdue', label: 'Overdue' },
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
          <ClipboardList className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No assignments found</h2>
          <p className="text-slate-400 text-sm">Enroll in courses to receive assignments from instructors.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => {
            const isSubmitted = a.submissions.length > 0
            const overdue = isOverdue(a.dueDate)
            const dueSoon = isDueSoon(a.dueDate)
            return (
              <div key={a.id} className={`card border ${
                isSubmitted ? 'border-emerald-800/40' :
                overdue ? 'border-red-800/40' :
                dueSoon ? 'border-amber-800/40' :
                'border-slate-700/50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-white">{a.title}</h3>
                      <span className={`badge text-xs ${typeColors[a.type]}`}>{a.type}</span>
                      {isSubmitted && <span className="badge text-xs badge-success">Submitted</span>}
                      {!isSubmitted && overdue && <span className="badge text-xs badge-error">Overdue</span>}
                      {!isSubmitted && dueSoon && <span className="badge text-xs badge-warning">Due Soon</span>}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{a.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />{a.course?.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(a.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${
                        overdue ? 'text-red-400' : dueSoon ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {getTimeLeft(a.dueDate)}
                      </span>
                      <span>{a.totalMarks} marks</span>
                    </div>
                    {isSubmitted && a.submissions[0]?.grade !== null && a.submissions[0]?.grade !== undefined && (
                      <div className="mt-2 text-sm">
                        <span className="text-emerald-400 font-medium">Grade: {a.submissions[0].grade}/{a.totalMarks}</span>
                      </div>
                    )}
                  </div>
                  {!isSubmitted && !overdue && (
                    <button
                      onClick={() => { setSubmitModal(a); setContent(''); setSuccess('') }}
                      className="btn-primary flex items-center gap-2 ml-4 text-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit
                    </button>
                  )}
                  {isSubmitted && (
                    <div className="ml-4 flex items-center gap-1 text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4" /> Done
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-white">{submitModal.title}</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Due: {new Date(submitModal.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSubmitModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300">
                {submitModal.description}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Your Submission *</label>
                <textarea
                  className="input w-full h-40 resize-none"
                  placeholder="Write your answer or paste your work here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setSubmitModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || !content.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
