'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookOpen, ClipboardList, BarChart3, Users, ArrowRight, GraduationCap, BookMarked, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface Props {
  user: { name: string; email: string; role: string }
}

export default function InstructorDashboard({ user }: Props) {
  const [stats, setStats] = useState<any>(null)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const load = async () => {
      const [unitsRes, subsRes, examsRes] = await Promise.all([
        fetch('/api/instructor/units'),
        fetch('/api/instructor/submissions'),
        fetch('/api/instructor/exams'),
      ])
      const [units, submissions, exams] = await Promise.all([
        unitsRes.json(),
        subsRes.json(),
        examsRes.json(),
      ])
      const unitList = Array.isArray(units) ? units : []
      const subList = Array.isArray(submissions) ? submissions : []
      const examList = Array.isArray(exams) ? exams : []
      setStats({
        totalUnits: unitList.length,
        pendingGrades: subList.filter((s: any) => s.grade === null).length,
        totalSubmissions: subList.length,
        totalExams: examList.length,
        publishedExams: examList.filter((e: any) => e.isPublished).length,
      })
    }
    load()
  }, [])

  const quickLinks = [
    { href: '/dashboard/instructor/units', label: 'My Units', desc: 'Manage your assigned units, notes and CATs', icon: BookMarked, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { href: '/dashboard/instructor/assignments', label: 'Assignments', desc: 'Create and manage assignments', icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { href: '/dashboard/instructor/exams', label: 'Exams', desc: 'Create timed exams for students', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { href: '/dashboard/instructor/submissions', label: 'Grade Submissions', desc: 'Review and grade student work', icon: CheckCircle, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { href: '/dashboard/hod', label: 'HoD Overview', desc: 'View courses you oversee as HoD', icon: GraduationCap, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { href: '/dashboard/forum', label: 'Forum', desc: 'Interact with your students', icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  ]

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          {greeting}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Welcome to your Instructor Portal.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Assigned Units', value: stats.totalUnits, icon: BookMarked, color: 'text-primary-400' },
            { label: 'Pending Grades', value: stats.pendingGrades, icon: Clock, color: 'text-amber-400' },
            { label: 'Total Submissions', value: stats.totalSubmissions, icon: ClipboardList, color: 'text-emerald-400' },
            { label: 'Published Exams', value: stats.publishedExams + '/' + stats.totalExams, icon: TrendingUp, color: 'text-accent-400' },
          ].map(s => (
            <div key={s.label} className="card text-center py-5">
              <s.icon className={'w-6 h-6 mx-auto mb-2 ' + s.color} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-white font-semibold mb-4">Quick Access</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {quickLinks.map(item => (
            <Link key={item.href} href={item.href} className="card-hover group flex items-start gap-4">
              <div className={'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ' + item.bg}>
                <item.icon className={'w-6 h-6 ' + item.color} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">{item.label}</h3>
                <p className="text-slate-400 text-sm mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all mt-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Pending Grades Alert */}
      {stats?.pendingGrades > 0 && (
        <div className="card border border-amber-800/40 bg-amber-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">You have {stats.pendingGrades} ungraded submission{stats.pendingGrades > 1 ? 's' : ''}</p>
                <p className="text-slate-400 text-sm">Students are waiting for their grades.</p>
              </div>
            </div>
            <Link href="/dashboard/instructor/submissions" className="btn-primary text-sm flex-shrink-0">
              Grade Now
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
