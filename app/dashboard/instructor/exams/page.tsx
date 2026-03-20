export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Eye, EyeOff, Clock, BookOpen, X, Check, Loader2, ListChecks } from 'lucide-react'

export default function InstructorExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    duration: 60,
    totalMarks: 100,
    passMark: 50,
    startTime: '',
    endTime: '',
  })

  const fetchData = async () => {
    setLoading(true)
    const [eRes, cRes] = await Promise.all([
      fetch('/api/instructor/exams'),
      fetch('/api/instructor/courses'),
    ])
    const [eData, cData] = await Promise.all([eRes.json(), cRes.json()])
    setExams(Array.isArray(eData) ? eData : [])
    setCourses(Array.isArray(cData) ? cData : [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    if (!form.title || !form.courseId || !form.startTime) {
      setError('Please fill in all required fields')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/instructor/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          duration: Number(form.duration),
          totalMarks: Number(form.totalMarks),
          passMark: Number(form.passMark),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setShowModal(false)
      setForm({ title: '', description: '', courseId: '', duration: 60, totalMarks: 100, passMark: 50, startTime: '', endTime: '' })
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (exam: any) => {
    await fetch(`/api/instructor/exams/${exam.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !exam.isPublished }),
    })
    fetchData()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/instructor/exams/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchData()
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Exams</h1>
          <p className="text-slate-400 mt-1">Create and manage timed exams for students</p>
        </div>
        <button onClick={() => { setShowModal(true); setError('') }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Exam
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-20">
          <Clock className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No exams yet</h2>
          <p className="text-slate-400 text-sm">Create your first timed exam for students.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{exam.title}</h3>
                    <span className={`badge text-xs ${exam.isPublished ? 'badge-success' : 'bg-slate-700 text-slate-300'}`}>
                      {exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {exam.description && <p className="text-slate-400 text-sm mb-3">{exam.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />{exam.course?.title}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />{exam.duration} mins
                    </span>
                    <span>Pass: {exam.passMark}%</span>
                    <span>{exam._count?.attempts ?? 0} attempts</span>
                    {exam.startTime && (
                      <span>Starts: {new Date(exam.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/dashboard/instructor/exams/${exam.id}`)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <ListChecks className="w-4 h-4" /> Questions
                  </button>
                  <button
                    onClick={() => togglePublish(exam)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    {exam.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(exam.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="font-display text-lg font-bold text-white">New Exam</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Exam Title *</label>
                <input className="input w-full" placeholder="e.g. Midterm Exam" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                <textarea className="input w-full h-20 resize-none" placeholder="Instructions for students..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Course *</label>
                <select className="input w-full" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                  <option value="">Select a course</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Duration (mins) *</label>
                  <input type="number" className="input w-full" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Total Marks</label>
                  <input type="number" className="input w-full" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Pass Mark %</label>
                  <input type="number" className="input w-full" value={form.passMark} onChange={e => setForm({ ...form, passMark: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Start Time *</label>
                  <input type="datetime-local" className="input w-full" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">End Time</label>
                  <input type="datetime-local" className="input w-full" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-white font-bold text-lg mb-2">Delete Exam?</h2>
            <p className="text-slate-400 text-sm mb-6">This will delete the exam and all student attempts.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
