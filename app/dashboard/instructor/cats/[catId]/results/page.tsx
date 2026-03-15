'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Users, TrendingUp, Award } from 'lucide-react'

export default function CATResultsPage() {
  const { catId } = useParams()
  const router = useRouter()
  const [cat, setCat] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/instructor/cats/' + catId + '/results')
      const data = await res.json()
      setCat(data)
      setLoading(false)
    }
    load()
  }, [catId])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  const attempts = cat?.attempts ?? []
  const passed = attempts.filter((a: any) => a.passed).length
  const failed = attempts.filter((a: any) => !a.passed).length
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.score ?? 0), 0) / attempts.length)
    : 0
  const passRate = attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{cat?.title} — Results</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {cat?.module?.course?.title} · {cat?.module?.title}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attempts', value: attempts.length, icon: Users, color: 'text-primary-400' },
          { label: 'Passed', value: passed, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Failed', value: failed, icon: XCircle, color: 'text-red-400' },
          { label: 'Pass Rate', value: passRate + '%', icon: TrendingUp, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card text-center py-5">
            <s.icon className={'w-6 h-6 mx-auto mb-2 ' + s.color} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Average Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Average Score</span>
          <span className="text-white font-bold">{avgScore}/{cat?.totalMarks}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary-500 transition-all"
            style={{ width: cat?.totalMarks > 0 ? (avgScore / cat.totalMarks * 100) + '%' : '0%' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attempts List */}
        <div>
          <h2 className="text-white font-semibold mb-3">Student Results</h2>
          {attempts.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No attempts yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.map((attempt: any) => (
                <div
                  key={attempt.id}
                  onClick={() => setSelected(selected?.id === attempt.id ? null : attempt)}
                  className={'card cursor-pointer transition-all hover:border-primary-500/30 ' + (selected?.id === attempt.id ? 'border-primary-500/50' : '')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{attempt.student?.name}</p>
                      <p className="text-slate-400 text-xs">{attempt.student?.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-sm">
                        {attempt.score}/{cat?.totalMarks}
                      </span>
                      {attempt.passed
                        ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                        : <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div
                      className={'h-1 rounded-full ' + (attempt.passed ? 'bg-emerald-500' : 'bg-red-500')}
                      style={{ width: cat?.totalMarks > 0 ? (attempt.score / cat.totalMarks * 100) + '%' : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Answer Breakdown */}
        <div>
          <h2 className="text-white font-semibold mb-3">
            {selected ? selected.student?.name + "'s Answers" : 'Select a student to view answers'}
          </h2>
          {!selected ? (
            <div className="card text-center py-12">
              <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Click a student to see their answers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cat?.questions?.map((q: any, i: number) => {
                const studentAnswer = selected.answers?.[q.id]
                const isCorrect = studentAnswer === q.answer ||
                  studentAnswer?.toLowerCase().trim() === q.answer?.toLowerCase().trim()
                return (
                  <div key={q.id} className={'card border ' + (isCorrect ? 'border-emerald-800/30' : 'border-red-800/30')}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="w-5 h-5 rounded bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-white text-sm">{q.text}</p>
                    </div>
                    <div className="ml-7 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Student:</span>
                        <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                          {studentAnswer || 'No answer'}
                        </span>
                        {isCorrect
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400" />
                        }
                      </div>
                      {!isCorrect && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Correct:</span>
                          <span className="text-emerald-400">{q.answer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
