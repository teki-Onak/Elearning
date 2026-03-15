'use client'

import { useEffect, useState } from 'react'
import { Clock, GraduationCap, BookOpen, ClipboardList, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Starting now!'); return }

      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)

      setUrgent(diff < 3600000) // less than 1 hour

      if (days > 0) setTimeLeft(days + 'd ' + hours + 'h ' + mins + 'm')
      else if (hours > 0) setTimeLeft(hours + 'h ' + mins + 'm ' + secs + 's')
      else setTimeLeft(mins + 'm ' + secs + 's')
    }

    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  return { timeLeft, urgent }
}

function CountdownItem({ item, type }: { item: any, type: 'exam' | 'cat' | 'assignment' }) {
  const date = type === 'assignment' ? item.dueDate : item.startTime
  const { timeLeft, urgent } = useCountdown(date)
  const router = useRouter()

  const icons = {
    exam: <GraduationCap className="w-4 h-4 text-primary-400" />,
    cat: <BookOpen className="w-4 h-4 text-amber-400" />,
    assignment: <ClipboardList className="w-4 h-4 text-emerald-400" />,
  }

  const labels = {
    exam: 'Exam',
    cat: 'CAT',
    assignment: 'Assignment',
  }

  const colors = {
    exam: 'border-primary-500/20 bg-primary-500/5',
    cat: 'border-amber-500/20 bg-amber-500/5',
    assignment: 'border-emerald-500/20 bg-emerald-500/5',
  }

  const subtitle = type === 'exam'
    ? item.course?.title
    : type === 'cat'
    ? item.module?.course?.title + ' · ' + item.module?.title
    : item.course?.title

  return (
    <div className={'flex items-center justify-between p-3 rounded-xl border ' + colors[type]}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">{labels[type]}</span>
          </div>
          <p className="text-white text-sm font-medium truncate">{item.title}</p>
          <p className="text-slate-500 text-xs truncate">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <div className="text-right">
          <div className={'text-sm font-bold font-mono ' + (urgent ? 'text-red-400 animate-pulse' : 'text-white')}>
            {timeLeft}
          </div>
          <div className="text-slate-500 text-xs">
            {type === 'assignment' ? 'due' : 'starts'}
          </div>
        </div>
        <button
          onClick={() => router.push(type === 'assignment' ? '/dashboard/assignments' : type === 'exam' ? '/dashboard/exams' : '/dashboard/units')}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function UpcomingCountdown() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/student/upcoming')
      const d = await res.json()
      setData(d)
      setLoading(false)
    }
    load()
  }, [])

  const exams = data?.exams ?? []
  const cats = data?.cats ?? []
  const assignments = data?.assignments ?? []

  const all = [
    ...exams.map((e: any) => ({ ...e, _type: 'exam', _date: e.startTime })),
    ...cats.map((c: any) => ({ ...c, _type: 'cat', _date: c.startTime })),
    ...assignments.map((a: any) => ({ ...a, _type: 'assignment', _date: a.dueDate })),
  ].sort((a, b) => new Date(a._date).getTime() - new Date(b._date).getTime())
  .slice(0, 6)

  if (loading) return null
  if (all.length === 0) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary-400" />
        <h2 className="text-white font-semibold">Upcoming Deadlines</h2>
        <span className="bg-primary-500/20 text-primary-400 text-xs px-2 py-0.5 rounded-full">{all.length}</span>
      </div>
      <div className="space-y-2">
        {all.map((item: any) => (
          <CountdownItem key={item.id} item={item} type={item._type} />
        ))}
      </div>
    </div>
  )
}
