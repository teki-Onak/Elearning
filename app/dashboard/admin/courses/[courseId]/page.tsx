'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, UserPlus, Trash2, X, Check, Loader2, BookOpen, Users, GraduationCap, UserMinus } from 'lucide-react'

export default function AdminCourseUnitsPage() {
  const { courseId } = useParams()
  const router = useRouter()
  const [units, setUnits] = useState<any[]>([])
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [instructors, setInstructors] = useState<any[]>([])
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null)
  const [showHodModal, setShowHodModal] = useState(false)
  const [unitForm, setUnitForm] = useState({ title: '', description: '' })
  const [selectedInstructor, setSelectedInstructor] = useState('')
  const [selectedHod, setSelectedHod] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const [unitsRes, courseRes] = await Promise.all([
      fetch(`/api/admin/courses/${courseId}/units`),
      fetch(`/api/courses/${courseId}`),
    ])
    const [unitsData, courseData] = await Promise.all([unitsRes.json(), courseRes.json()])
    setUnits(Array.isArray(unitsData) ? unitsData : [])
    setCourse(courseData)
    setLoading(false)
  }

  const fetchInstructors = async () => {
    const res = await fetch('/api/admin/users?role=INSTRUCTOR&limit=100')
    const data = await res.json()
    setInstructors(Array.isArray(data.users) ? data.users : [])
  }

  const fetchAllUsers = async () => {
    const res = await fetch('/api/admin/users?limit=100')
    const data = await res.json()
    setInstructors(Array.isArray(data.users) ? data.users : [])
  }

  useEffect(() => { fetchData() }, [courseId])

  const handleCreateUnit = async () => {
    if (!unitForm.title.trim()) return setError('Title is required')
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create unit')
      setShowUnitModal(false)
      setUnitForm({ title: '', description: '' })
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignInstructor = async () => {
    if (!selectedInstructor || !showAssignModal) return
    setSaving(true)
    try {
      await fetch(`/api/admin/units/${showAssignModal}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId: selectedInstructor }),
      })
      setShowAssignModal(null)
      setSelectedInstructor('')
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveInstructor = async (unitId: string, instructorId: string) => {
    await fetch(`/api/admin/units/${unitId}/assign`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructorId }),
    })
    fetchData()
  }

  const handleAssignHod = async () => {
    if (!selectedHod) return
    setSaving(true)
    try {
      await fetch(`/api/admin/courses/${courseId}/hod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hodId: selectedHod }),
      })
      setShowHodModal(false)
      setSelectedHod('')
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/admin/courses')}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-white">
            {course?.title || 'Course Units'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage units and assign instructors</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowHodModal(true); fetchAllUsers() }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <GraduationCap className="w-4 h-4" /> Assign HoD
          </button>
          <button
            onClick={() => { setShowUnitModal(true); setError('') }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Unit
          </button>
        </div>
      </div>

      {/* HoD Info */}
      {course?.hods?.length > 0 && (
              <div className="card border border-primary-500/30 bg-primary-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-white text-sm font-medium">Head of Department</p>
                      <p className="text-slate-400 text-xs">{course.hods[0]?.hod?.name} — {course.hods[0]?.hod?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/courses/${courseId}/hod`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hodId: course.hods[0]?.hod?.id }),
                      })
                      fetchData()
                    }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <UserMinus className="w-3.5 h-3.5" /> Remove HoD
                  </button>
                </div>
              </div>
            )}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : units.length === 0 ? (
        <div className="card text-center py-20">
          <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No units yet</h2>
          <p className="text-slate-400 text-sm mb-6">Add units to this course and assign instructors.</p>
          <button onClick={() => { setShowUnitModal(true); setError('') }} className="btn-primary">
            Add First Unit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {units.map((unit, i) => (
            <div key={unit.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold text-white text-lg">{unit.title}</h3>
                  </div>
                  {unit.description && (
                    <p className="text-slate-400 text-sm mb-3 ml-11">{unit.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400 ml-11 mb-3">
                    <span>{unit._count?.lessons ?? 0} lessons</span>
                    <span>{unit._count?.assignments ?? 0} assignments</span>
                    <span>{unit._count?.cats ?? 0} CATs</span>
                  </div>

                  {/* Assigned Instructors */}
                  <div className="ml-11">
                    {unit.unitInstructors?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {unit.unitInstructors.map((ui: any) => (
                          <div key={ui.id} className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-xs text-primary-400 font-bold">
                              {ui.instructor.name[0]}
                            </div>
                            <span className="text-sm text-white">{ui.instructor.name}</span>
                            <button
                              onClick={() => handleRemoveInstructor(unit.id, ui.instructor.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-amber-400 text-xs">No instructor assigned</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => { setShowAssignModal(unit.id); fetchInstructors() }}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" /> Assign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="font-display text-lg font-bold text-white">Add New Unit</h2>
              <button onClick={() => setShowUnitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Unit Title *</label>
                <input
                  className="input w-full"
                  placeholder="e.g. Unit 1: Introduction to Programming"
                  value={unitForm.title}
                  onChange={e => setUnitForm({ ...unitForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                <textarea
                  className="input w-full h-24 resize-none"
                  placeholder="What will students learn in this unit?"
                  value={unitForm.description}
                  onChange={e => setUnitForm({ ...unitForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setShowUnitModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreateUnit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Instructor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Assign Instructor</h2>
              <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Select an instructor for this unit.</p>
            <select
              className="input w-full mb-4"
              value={selectedInstructor}
              onChange={e => setSelectedInstructor(e.target.value)}
            >
              <option value="">Select instructor</option>
              {instructors.map((i: any) => (
                <option key={i.id} value={i.id}>{i.name} — {i.email}</option>
              ))}
            </select>
            {instructors.length === 0 && (
              <p className="text-amber-400 text-xs mb-4">No instructors found. Go to Users and set a user role to Instructor first.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowAssignModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAssignInstructor} disabled={saving || !selectedInstructor} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign HoD Modal */}
      {showHodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Assign Head of Department</h2>
              <button onClick={() => setShowHodModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">The HoD oversees this entire course and all its units.</p>
            <select
              className="input w-full mb-4"
              value={selectedHod}
              onChange={e => setSelectedHod(e.target.value)}
            >
              <option value="">Select a user</option>
              {instructors.map((i: any) => (
                <option key={i.id} value={i.id}>{i.name} — {i.email} ({i.role})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowHodModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAssignHod} disabled={saving || !selectedHod} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                Assign HoD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
