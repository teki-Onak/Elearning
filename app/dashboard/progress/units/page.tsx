export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, BookMarked, ClipboardList, GraduationCap, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'

export default function UnitProgressPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/student/progress/unit')
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [])

  const getColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500'
    if (pct >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTextColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400'
    if (pct >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Unit Progress</h1>
        <p className="text-slate-400 mt-1">Track your progress across all units and courses</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-20">
          <TrendingUp className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No progress yet</h2>
          <p className="text-slate-400 text-sm mb-4">Enroll in a course to start tracking your progress.</p>
          <button onClick={() => router.push('/dashboard/enroll')} className="btn-primary">Browse Courses</button>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <div key={course.id} className="card">
              {/* Course Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === course.id ? null : course.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-white font-semibold text-lg">{course.title}</h2>
                    <span className={`text-sm font-bold ${getTextColor(course.courseProgress)}`}>
                      {course.courseProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getColor(course.courseProgress)}`}
                      style={{ width: course.courseProgress + '%' }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{course.units?.length ?? 0} units</p>
                </div>
                <div className="ml-4">
                  {expanded === course.id
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />
                  }
                </div>
              </div>

              {/* Units Breakdown */}
              {expanded === course.id && (
                <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                  {course.units?.map((unit: any, i: number) => (
                    <div key={unit.id} className="bg-slate-800/40 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <h3 className="text-white text-sm font-medium">{unit.title}</h3>
                        </div>
                        <span className={`text-sm font-bold ${getTextColor(unit.overallProgress)}`}>
                          {unit.overallProgress}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                        <div
                          className={`h-1.5 rounded-full transition-all ${getColor(unit.overallProgress)}`}
                          style={{ width: unit.overallProgress + '%' }}
                        />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                          <BookMarked className="w-3.5 h-3.5 text-primary-400 mx-auto mb-1" />
                          <p className="text-white text-xs font-medium">{unit.notes.completed}/{unit.notes.total}</p>
                          <p className="text-slate-500 text-xs">Notes</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                          <p className="text-white text-xs font-medium">{unit.cats.passed}/{unit.cats.total}</p>
                          <p className="text-slate-500 text-xs">CATs Passed</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                          <ClipboardList className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                          <p className="text-white text-xs font-medium">{unit.assignments.submitted}/{unit.assignments.total}</p>
                          <p className="text-slate-500 text-xs">Assignments</p>
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
