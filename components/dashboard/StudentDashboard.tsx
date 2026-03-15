'use client'

import UpcomingCountdown from './UpcomingCountdown'
import Link from 'next/link'
import { BookOpen, TrendingUp, Award, Heart, ArrowRight, Clock, CheckCircle, Smile } from 'lucide-react'
import { formatDate, calcProgress, getMoodLabel, getMoodColor } from '@/lib/utils'

interface Props {
  user: { name: string; email: string; role: string }
  enrollments: any[]
  notifications: any[]
  wellbeingLogs: any[]
  achievements: any[]
}

export default function StudentDashboard({ user, enrollments, notifications, wellbeingLogs, achievements }: Props) {
  const latestMood = wellbeingLogs[0]

  const stats = [
    { label: 'Courses Enrolled', value: enrollments.length, icon: BookOpen, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Avg. Progress', value: `${enrollments.length > 0 ? Math.round(enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length) : 0}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Achievements', value: achievements.length, icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Mood Today', value: latestMood ? getMoodLabel(latestMood.mood) : 'Not logged', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          {greeting}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your learning overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div className="stat-value text-2xl">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

     {/* Upcoming Deadlines */}
      <UpcomingCountdown />
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Courses */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title text-xl">My Courses</h2>
            <Link href="/dashboard/courses" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No courses yet.</p>
              <Link href="/courses" className="btn-primary text-sm mt-4 inline-block">Browse Courses</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((e) => (
                <Link
                  key={e.id}
                  href={`/courses/${e.courseId}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-primary-300 transition-colors">
                      {e.course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="progress-bar flex-1">
                        <div className="progress-fill" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{e.progress}%</span>
                    </div>
                  </div>
                  {e.progress === 100 && (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Wellbeing + Notifications */}
        <div className="space-y-4">
          {/* Quick Wellbeing */}
          <div className="card">
            <h2 className="section-title text-lg mb-4">Wellbeing</h2>
            {latestMood ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Mood</span>
                  <span className={`text-sm font-medium ${getMoodColor(latestMood.mood)}`}>
                    {getMoodLabel(latestMood.mood)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Stress</span>
                  <span className={`text-sm font-medium ${getMoodColor(6 - latestMood.stress)}`}>
                    {latestMood.stress <= 2 ? 'Low' : latestMood.stress === 3 ? 'Moderate' : 'High'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Energy</span>
                  <span className={`text-sm font-medium ${getMoodColor(latestMood.energy)}`}>
                    {getMoodLabel(latestMood.energy)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Logged {formatDate(latestMood.createdAt)}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Smile className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs mb-3">How are you feeling today?</p>
                <Link href="/dashboard/wellbeing" className="btn-primary text-xs px-4 py-2 inline-block">
                  Log Wellbeing
                </Link>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="card">
            <h2 className="section-title text-lg mb-4">Achievements</h2>
            {achievements.length === 0 ? (
              <p className="text-slate-400 text-sm">Complete courses to earn achievements!</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {achievements.slice(0, 4).map((a) => (
                  <div key={a.id} className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                    <div className="text-2xl mb-1">{a.achievement.icon}</div>
                    <p className="text-xs text-slate-300 font-medium leading-tight">{a.achievement.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/courses', label: 'Browse Courses', icon: BookOpen, color: 'text-primary-400' },
          { href: '/dashboard/wellbeing', label: 'Log Wellbeing', icon: Heart, color: 'text-pink-400' },
          { href: '/dashboard/surveys', label: 'Take Survey', icon: Clock, color: 'text-amber-400' },
          { href: '/dashboard/forum', label: 'Join Forum', icon: TrendingUp, color: 'text-emerald-400' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="card-hover flex flex-col items-center gap-2 p-4 text-center group"
          >
            <action.icon className={`w-6 h-6 ${action.color}`} />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
