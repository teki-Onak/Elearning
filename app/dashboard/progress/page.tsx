'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { TrendingUp, BookOpen, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProgressPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch enrolled courses with progress
    fetch('/api/courses?enrolled=true')
      .then(r => r.json())
      .then(async (courses) => {
        const withProgress = await Promise.all(
          courses.map(async (course: any) => {
            const res = await fetch(`/api/progress?courseId=${course.id}`)
            const prog = await res.json()
            return { ...course, progress: prog }
          })
        )
        setEnrollments(withProgress)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  const chartData = enrollments.map(e => ({
    name: e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title,
    progress: e.progress?.percentage ?? 0,
    completed: e.progress?.completed ?? 0,
    total: e.progress?.total ?? 0,
  }))

  const totalCompleted = enrollments.reduce((a, e) => a + (e.progress?.completed ?? 0), 0)
  const totalLessons = enrollments.reduce((a, e) => a + (e.progress?.total ?? 0), 0)
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((a, e) => a + (e.progress?.percentage ?? 0), 0) / enrollments.length)
    : 0
  const completedCourses = enrollments.filter(e => e.progress?.percentage === 100).length

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-emerald-400" /> My Progress
        </h1>
        <p className="text-slate-400 mt-1">Track your learning journey across all enrolled courses</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Courses Enrolled', value: enrollments.length, icon: BookOpen, color: 'text-primary-400' },
          { label: 'Courses Completed', value: completedCourses, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Lessons Done', value: totalCompleted, icon: Clock, color: 'text-amber-400' },
          { label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-accent-400' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div className="stat-value text-2xl">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h2 className="section-title text-xl mb-6">Progress by Course</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} width={120} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, 'Progress']}
              />
              <Bar dataKey="progress" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Course list */}
      <div className="card">
        <h2 className="section-title text-xl mb-5">Course Details</h2>
        {enrollments.length === 0 ? (
          <p className="text-slate-400 text-sm">Enroll in courses to start tracking your progress.</p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{e.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="progress-bar flex-1">
                      <div className="progress-fill" style={{ width: `${e.progress?.percentage ?? 0}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {e.progress?.completed ?? 0}/{e.progress?.total ?? 0} lessons
                    </span>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 ${e.progress?.percentage === 100 ? 'badge-success' : 'badge-primary'}`}>
                  {e.progress?.percentage ?? 0}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
