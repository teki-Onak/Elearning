'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Loader2, ChevronRight, BookMarked, ClipboardList, GraduationCap, User } from 'lucide-react'

export default function StudentUnitsPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/student/units')
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Course Units</h1>
        <p className="text-slate-400 mt-1">View notes, assignments and CATs for each unit</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-20">
          <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No courses enrolled</h2>
          <p className="text-slate-400 text-sm">Enroll in a course to see its units.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {courses.map((course: any) => (
            <div key={course.id}>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-primary-400" />
                <h2 className="text-white font-semibold text-lg">{course.title}</h2>
                <span className="text-slate-500 text-sm">({course.modules?.length ?? 0} units)</span>
              </div>
              {course.modules?.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-slate-400 text-sm">No units available yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules?.map((unit: any, i: number) => (
                    <div
                      key={unit.id}
                      onClick={() => router.push(`/dashboard/units/${unit.id}`)}
                      className="card cursor-pointer hover:border-primary-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                              {unit.title}
                            </h3>
                            {unit.description && (
                              <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{unit.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <BookMarked className="w-3 h-3" />{unit._count?.lessons ?? 0} notes
                              </span>
                              <span className="flex items-center gap-1">
                                <ClipboardList className="w-3 h-3" />{unit._count?.assignments ?? 0} assignments
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />{unit._count?.cats ?? 0} CATs
                              </span>
                              {unit.unitInstructors?.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />{unit.unitInstructors[0]?.instructor?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
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
