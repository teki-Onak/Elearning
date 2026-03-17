'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Users, BookOpen, Layers, Loader2, ChevronDown, ChevronUp, User, BookMarked, ClipboardList, Plus, X, Check } from 'lucide-react'

export default function HoDDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showUnitModal, setShowUnitModal] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null)
  const [unitForm, setUnitForm] = useState({ title: '', description: '' })
  const [instructors, setInstructors] = useState<any[]>([])
  const [selectedInstructor, setSelectedInstructor] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/hod/overview')
    const d = await res.json()
    setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

const fetchInstructors = async () => {
    const res = await fetch('/api/hod/instructors')
    const data = await res.json()
    setInstructors(Array.isArray(data.users) ? data.users : [])
  }

  const handleCreateUnit = async (courseId: string) => {
    if (!unitForm.title) return
    setSaving(true)
    try {
      await fetch('/api/hod/courses/' + courseId + '/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitForm),
      })
      setShowUnitModal(null)
      setUnitForm({ title: '', description: '' })
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleAssignInstructor = async (unitId: string) => {
    if (!selectedInstructor) return
    setSaving(true)
    try {
      await fetch('/api/admin/units/' + unitId + '/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId: selectedInstructor }),
      })
      setShowAssignModal(null)
      setSelectedInstructor('')
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  const stats = data?.stats
  const courses = data?.courses ?? []

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">HoD Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your courses, units and instructors</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Courses', value: stats?.totalCourses ?? 0, icon: BookOpen, color: 'text-primary-400' },
          { label: 'Units', value: stats?.totalUnits ?? 0, icon: Layers, color: 'text-accent-400' },
          { label: 'Instructors', value: stats?.totalInstructors ?? 0, icon: User, color: 'text-emerald-400' },
          { label: 'Students', value: stats?.totalStudents ?? 0, icon: Users, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card text-center py-5">
            <s.icon className={'w-6 h-6 mx-auto mb-2 ' + s.color} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-20">
          <GraduationCap className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No courses assigned</h2>
          <p className="text-slate-400 text-sm">Ask the admin to assign you as HoD for a course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">My Courses</h2>
          {courses.map((course: any) => (
            <div key={course.id} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === course.id ? null : course.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{course.modules?.length ?? 0} units</span>
                      <span>{course._count?.enrollments ?? 0} students</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setShowUnitModal(course.id) }}
                    className="btn-primary text-xs flex items-center gap-1 py-1.5 px-3"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Unit
                  </button>
                  {expanded === course.id
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />
                  }
                </div>
              </div>

              {expanded === course.id && (
                <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                  {course.modules?.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No units yet.</p>
                  ) : course.modules.map((unit: any, i: number) => (
                    <div key={unit.id} className="bg-slate-800/40 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <h4 className="text-white font-medium text-sm">{unit.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <BookMarked className="w-3 h-3" />{unit._count?.lessons ?? 0} notes
                              </span>
                              <span className="flex items-center gap-1">
                                <ClipboardList className="w-3 h-3" />{unit._count?.assignments ?? 0} assignments
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />{unit._count?.cats ?? 0} CATs
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                          {unit.unitInstructors?.length === 0 ? (
                            <span className="text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded-lg">No instructor</span>
                          ) : unit.unitInstructors.map((ui: any) => (
                            <span key={ui.instructor.id} className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded-lg flex items-center gap-1">
                              <User className="w-3 h-3 text-primary-400" />{ui.instructor.name}
                            </span>
                          ))}
                          <button
                            onClick={() => { setShowAssignModal(unit.id); fetchInstructors() }}
                            className="text-xs text-primary-400 bg-primary-900/20 px-2 py-1 rounded-lg hover:bg-primary-900/30 transition-colors"
                          >
                            + Assign
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Add Unit</h2>
              <button onClick={() => setShowUnitModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Unit Title *</label>
                <input className="input w-full" placeholder="e.g. Unit 1: Introduction" value={unitForm.title} onChange={e => setUnitForm({ ...unitForm, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                <textarea className="input w-full h-20 resize-none" placeholder="What will students learn?" value={unitForm.description} onChange={e => setUnitForm({ ...unitForm, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUnitModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleCreateUnit(showUnitModal)} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Assign Instructor</h2>
              <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <select className="input w-full mb-4" value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}>
              <option value="">Select instructor</option>
              {instructors.map((i: any) => (
                <option key={i.id} value={i.id}>{i.name} — {i.email}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowAssignModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleAssignInstructor(showAssignModal)} disabled={saving || !selectedInstructor} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
