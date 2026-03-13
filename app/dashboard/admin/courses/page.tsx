'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, Search, X, Check, UserPlus, Layers } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  isPublished: boolean
  _count: { enrollments: number }
  createdAt: string
}

const emptyForm = {
  title: '',
  description: '',
  category: '',
  level: 'BEGINNER',
  duration: 60,
  thumbnail: '',
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [instructors, setInstructors] = useState<any[]>([])
  const [selectedInstructor, setSelectedInstructor] = useState('')
  const [assigning, setAssigning] = useState(false)
  const router = useRouter()

  const fetchCourses = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/courses')
    const data = await res.json()
    setCourses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const fetchInstructors = async () => {
    const res = await fetch('/api/admin/users?role=INSTRUCTOR&limit=100')
    const data = await res.json()
    setInstructors(Array.isArray(data.users) ? data.users : [])
  }

  const handleAssign = async () => {
    if (!selectedInstructor || !assignModal) return
    setAssigning(true)
    await fetch('/api/admin/assign-instructor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: assignModal, instructorId: selectedInstructor }),
    })
    setAssigning(false)
    setAssignModal(null)
    setSelectedInstructor('')
  }

  useEffect(() => { fetchCourses() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (course: Course) => {
    setEditing(course)
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      thumbnail: '',
    })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/courses/${editing.id}` : '/api/courses'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration: Number(form.duration) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setShowModal(false)
      fetchCourses()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (course: Course) => {
    await fetch(`/api/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    })
    fetchCourses()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchCourses()
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )

  const levelColors: Record<string, string> = {
    BEGINNER: 'badge-success',
    INTERMEDIATE: 'badge-warning',
    ADVANCED: 'badge-error',
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Manage Courses</h1>
          <p className="text-slate-400 mt-1">Create, edit, and publish courses for students</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10 w-full max-w-sm" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Courses', value: courses.length },
          { label: 'Published', value: courses.filter(c => c.isPublished).length },
          { label: 'Total Enrollments', value: courses.reduce((a, c) => a + c._count.enrollments, 0) },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No courses found. Create your first course!</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Course</th>
                <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Category</th>
                <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Level</th>
                <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Students</th>
                <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Status</th>
                <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(course => (
                <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium text-sm">{course.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{course.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">{course.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${levelColors[course.level] || 'badge-primary'}`}>{course.level}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{course._count.enrollments}</td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${course.isPublished ? 'badge-success' : 'bg-slate-700 text-slate-300'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setAssignModal(course.id); fetchInstructors() }} title="Assign Instructor" className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                      <button onClick={() => router.push(`/dashboard/admin/courses/${course.id}`)} title="Manage Units" className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">  <Layers className="w-4 h-4" /> </button>
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button onClick={() => togglePublish(course)} title={course.isPublished ? 'Unpublish' : 'Publish'} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(course)} title="Edit" className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(course.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="font-display text-lg font-bold text-white">{editing ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Course Title *</label>
                <input className="input w-full" placeholder="e.g. Introduction to Web Development" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Description *</label>
                <textarea className="input w-full h-24 resize-none" placeholder="Describe what students will learn..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Category *</label>
                  <input className="input w-full" placeholder="e.g. Programming" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Level *</label>
                  <select className="input w-full" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Duration (minutes) *</label>
                <input type="number" className="input w-full" placeholder="e.g. 120" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                {editing ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Instructor Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Assign Instructor</h2>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Select an instructor to assign to this course.</p>
            <select className="input w-full mb-4" value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}>
              <option value="">Select an instructor</option>
              {instructors.map((i: any) => (
                <option key={i.id} value={i.id}>{i.name} — {i.email}</option>
              ))}
            </select>
            {instructors.length === 0 && (
              <p className="text-amber-400 text-xs mb-4">No instructors found. Go to Users and change a user role to Instructor first.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAssign} disabled={assigning || !selectedInstructor} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {assigning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-white font-bold text-lg mb-2">Delete Course?</h2>
            <p className="text-slate-400 text-sm mb-6">This will permanently delete the course and all its data. This cannot be undone.</p>
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
