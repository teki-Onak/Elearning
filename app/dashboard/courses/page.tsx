'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Clock, CheckCircle, ArrowRight, GraduationCap, Award, Loader2 } from 'lucide-react'

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/student/courses')
      const data = await res.json()
      setEnrollments(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My Courses</h1>
          <p className="text-slate-400 mt-1">Track your enrolled courses and progress</p>
        </div>
        <button onClick={() => router.push('/dashboard/enroll')} className="btn-primary flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Browse More
        </button>
      </div>

      {enrollments.length === 0 ? (
        <div className="card text-center py-20">
          <GraduationCap className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No courses yet</h2>
          <p className="text-slate-400 text-sm mb-6">You haven't enrolled in any courses yet!</p>
          <button onClick={() => router.push('/dashboard/enroll')} className="btn-primary inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((e) => (
            <div key={e.id} className="card flex flex-col group">
              {/* Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-primary-900/60 to-accent-900/40 rounded-xl mb-4 flex items-center justify-center border border-slate-700/30 relative">
                <BookOpen className="w-9 h-9 text-primary-400/60" />
                {e.progress === 100 && (
                  <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                {e.course?.category && (
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    {e.course.category}
                  </span>
                )}
                <span className={'badge text-xs ' + (
                  e.progress === 100 ? 'badge-success' :
                  e.progress > 0 ? 'badge-warning' : 'badge-primary'
                )}>
                  {e.progress === 100 ? 'Completed' : e.progress > 0 ? 'In Progress' : 'Not Started'}
                </span>
              </div>

              <h3 className="font-display font-semibold text-white group-hover:text-primary-300 transition-colors mb-3 leading-snug flex-1">
                {e.course?.title}
              </h3>

              {/* Progress Bar */}
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{e.completedLessons} / {e.totalLessons} lessons</span>
                  <span>{e.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: e.progress + '%' }} />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                <button
                  onClick={() => router.push('/dashboard/units')}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {e.progress === 100 ? 'Review' : e.progress > 0 ? 'Continue' : 'Start'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => router.push('/dashboard/certificate?courseId=' + e.courseId)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" /> Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
