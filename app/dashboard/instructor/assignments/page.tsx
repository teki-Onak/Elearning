export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { Plus, ClipboardList, Trash2, X, Check, Loader2, Calendar, BookOpen } from 'lucide-react'

export default function InstructorAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'ASSIGNMENT',
    courseId: '',
    dueDate: '',
    totalMarks: 100,
  })

  const fetchData = async () => {
    setLoading(true)
    const [aRes, cRes] = await Promise.all([
      fetch('/api/instructor/assignments'),
      fetch('/api/instructor/courses'),
    ])
    const [aData, cData] = await Promise.all([aRes.json(), cRes.json()])
    setAssignments(Array.isArray(aData) ? aData : [])
    setCourses(Array.isArray(cData) ? cData : [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    if (!form.title || !form.courseId || !form.dueDate) {
      setError('Please fill in all required fields')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/instructor/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, totalMarks: Number(form.totalMarks) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setShowModal(false)
      setForm({ title: '', description: '', type: 'ASSIGNMENT', courseId: '', dueDate: '', totalMarks: 100 })
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/instructor/assignments/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchData()
  }

  const typeColors: Record<string, string> = {
    ASSIGNMENT: 'badge-primary',
    PROJECT: 'badge-warning',
    EXAM: 'badge-error',
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Assignments</h1>
          <p className="text-slate-400 mt-1">Create and manage assignments for your students</p>
        </div>
        <button onClick={() => { setShowModal(true); setError('') }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="card text-center py-20">
          <ClipboardList className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No assignments yet</h2>
          <p className="text-slate-400 text-sm">Create your first assignment for students.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{a.title}</h3>
                    <span className={`badge text-xs ${typeColors[a.type]}`}>{a.type}</span>
                    {isOverdue(a.dueDate) && <span className="badge text-xs badge-error">Overdue</span>}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{a.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />{a.course?.title}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {new Date(a.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>{a.totalMarks} marks</span>
                    <span>{a._count?.submissions ?? 0} submissions</span>
                  </div>
                </div>
                <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors ml-4">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="font-display text-lg font-bold text-white">New Assignment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Title *</label>
                <input className="input w-full" placeholder="e.g. Week 3 Assignment" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                <textarea className="input w-full h-24 resize-none" placeholder="Describe what students need to do..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Type *</label>
                  <select className="input w-full" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="PROJECT">Project</option>
                    <option value="EXAM">Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Total Marks</label>
                  <input type="number" className="input w-full" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} />
                </div>
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

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Due Date *</label>
                <input type="datetime-local" className="input w-full" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-white font-bold text-lg mb-2">Delete Assignment?</h2>
            <p className="text-slate-400 text-sm mb-6">This will delete the assignment and all student submissions.</p>
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
