'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Users, BookOpen, Layers, Loader2, ChevronDown, ChevronUp, User, BookMarked, ClipboardList } from 'lucide-react'

export default function HoDDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/hod/overview')
      const d = await res.json()
      setData(d)
      setLoading(false)
    }
    load()
  }, [])

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

      {/* Stats */}
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

      {/* Courses */}
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
                {expanded === course.id
                  ? <ChevronUp className="w-5 h-5 text-slate-400" />
                  : <ChevronDown className="w-5 h-5 text-slate-400" />
                }
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
    </div>
  )
}
