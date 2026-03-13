'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Loader2, ChevronRight, BookMarked, ClipboardList, GraduationCap } from 'lucide-react'

export default function InstructorUnitsPage() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true)
      const res = await fetch('/api/instructor/units')
      const data = await res.json()
      setUnits(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    fetch_()
  }, [])

  const grouped = units.reduce((acc: any, unit: any) => {
    const courseId = unit.course?.id
    if (!acc[courseId]) acc[courseId] = { course: unit.course, units: [] }
    acc[courseId].units.push(unit)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Units</h1>
        <p className="text-slate-400 mt-1">Manage your assigned units across all courses</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : units.length === 0 ? (
        <div className="card text-center py-20">
          <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No units assigned yet</h2>
          <p className="text-slate-400 text-sm">Ask your admin to assign units to you.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.values(grouped).map((group: any) => (
            <div key={group.course.id}>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-primary-400" />
                <h2 className="text-white font-semibold text-lg">{group.course.title}</h2>
              </div>
              <div className="space-y-3">
                {group.units.map((unit: any, i: number) => (
                  <div
                    key={unit.id}
                    onClick={() => router.push(`/dashboard/instructor/units/${unit.id}`)}
                    className="card cursor-pointer hover:border-primary-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {unit.title}
                          </h3>
                          {unit.description && (
                            <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{unit.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <BookMarked className="w-3 h-3" /> {unit._count?.lessons ?? 0} notes
                            </span>
                            <span className="flex items-center gap-1">
                              <ClipboardList className="w-3 h-3" /> {unit._count?.assignments ?? 0} assignments
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" /> {unit._count?.cats ?? 0} CATs
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
