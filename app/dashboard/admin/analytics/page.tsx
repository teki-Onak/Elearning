'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Users, BookOpen, TrendingUp, Award, Heart, ClipboardList, Loader2 } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">Failed to load analytics data.</p>
      </div>
    )
  }

  const { stats, enrollmentTrend, topCourses, wellbeingAvg } = data

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Students', value: stats.totalStudents, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Enrollments', value: stats.totalEnrollments, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Published Courses', value: stats.totalCourses, icon: Award, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Survey Responses', value: stats.totalSurveyResponses, icon: ClipboardList, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ]

  const wellbeingData = wellbeingAvg ? [
    { name: 'Mood', value: parseFloat((wellbeingAvg.mood ?? 0).toFixed(1)), fill: '#10b981' },
    { name: 'Energy', value: parseFloat((wellbeingAvg.energy ?? 0).toFixed(1)), fill: '#f59e0b' },
    { name: 'Stress', value: parseFloat((wellbeingAvg.stress ?? 0).toFixed(1)), fill: '#ef4444' },
  ] : []

  const courseChartData = topCourses.map((c: any) => ({
    name: c.title.length > 20 ? c.title.slice(0, 20) + '...' : c.title,
    enrollments: c._count.enrollments,
  }))

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Platform performance and insights overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title text-xl mb-6">Enrollment Trend (7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={enrollmentTrend}>
              <defs>
                <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} labelStyle={{ color: '#94a3b8' }} />
              <Area type="monotone" dataKey="enrollments" stroke="#0ea5e9" fill="url(#colorEnroll)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title text-xl mb-6">Top Courses by Enrollment</h2>
          {courseChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No course data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={courseChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="enrollments" radius={[0, 6, 6, 0]}>
                  {courseChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title text-xl mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" /> Avg. Wellbeing (Last 30 Days)
          </h2>
          {wellbeingData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No wellbeing data yet.</div>
          ) : (
            <div className="space-y-5 mt-2">
              {wellbeingData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{item.name}</span>
                    <span className="text-white font-medium">{item.value} / 5</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(item.value / 5) * 100}%`, background: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title text-xl mb-6">Enrollment Distribution</h2>
          {courseChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No course data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={courseChartData} dataKey="enrollments" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {courseChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
