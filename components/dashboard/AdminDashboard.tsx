'use client'

import { useEffect, useState } from 'react'
import { Users, BookOpen, TrendingUp, ClipboardList, BarChart3, Heart } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { stats, recentUsers, topCourses, enrollmentTrend, wellbeingAvg } = data

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Students', value: stats.totalStudents, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Enrollments', value: stats.totalEnrollments, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Survey Responses', value: stats.totalSurveyResponses, icon: ClipboardList, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  ]

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview and insights.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enrollment Trend Chart */}
        <div className="lg:col-span-2 card">
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
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="enrollments" stroke="#0ea5e9" fill="url(#colorEnroll)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Wellbeing Averages */}
        <div className="card">
          <h2 className="section-title text-xl mb-4">
            <Heart className="w-5 h-5 text-pink-400 inline mr-2" />
            Avg. Wellbeing (30d)
          </h2>
          {wellbeingAvg ? (
            <div className="space-y-4 mt-2">
              {[
                { label: 'Mood', value: wellbeingAvg.mood?.toFixed(1), color: 'from-emerald-600 to-emerald-400' },
                { label: 'Energy', value: wellbeingAvg.energy?.toFixed(1), color: 'from-amber-600 to-amber-400' },
                { label: 'Stress', value: wellbeingAvg.stress?.toFixed(1), color: 'from-red-600 to-red-400' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400">{m.label}</span>
                    <span className="text-white font-medium">{m.value ?? 'N/A'} / 5</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all`}
                      style={{ width: m.value ? `${(parseFloat(m.value) / 5) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No wellbeing data yet.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <h2 className="section-title text-xl mb-5">Recent Signups</h2>
          <div className="space-y-3">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`badge text-xs ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(u.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="card">
          <h2 className="section-title text-xl mb-5">Top Courses</h2>
          <div className="space-y-3">
            {topCourses.map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 text-slate-500 text-sm font-mono">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{c.title}</p>
                  <p className="text-xs text-slate-400">{c.category}</p>
                </div>
                <span className="badge-primary text-xs">{c._count.enrollments} enrolled</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
