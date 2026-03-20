export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { Loader2, GraduationCap, BookOpen, ClipboardList, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'

type Tab = 'exams' | 'cats' | 'assignments'

export default function StudentResultsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('exams')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/student/results')
      const d = await res.json()
      setData(d)
      setLoading(false)
    }
    load()
  }, [])

  const examAttempts = data?.examAttempts ?? []
  const catAttempts = data?.catAttempts ?? []
  const assignmentSubmissions = data?.assignmentSubmissions ?? []

  const examPassed = examAttempts.filter((a: any) => a.passed).length
  const catPassed = catAttempts.filter((a: any) => a.passed).length
  const assignGraded = assignmentSubmissions.filter((a: any) => a.grade != null).length

  const tabs = [
    { key: 'exams', label: 'Exams', icon: GraduationCap, count: examAttempts.length },
    { key: 'cats', label: 'CATs', icon: BookOpen, count: catAttempts.length },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList, count: assignmentSubmissions.length },
  ]

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Results</h1>
        <p className="text-slate-400 mt-1">View all your exam, CAT and assignment results</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Exams Passed', value: examPassed + '/' + examAttempts.length, icon: GraduationCap, color: 'text-primary-400' },
          { label: 'CATs Passed', value: catPassed + '/' + catAttempts.length, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Assignments Graded', value: assignGraded + '/' + assignmentSubmissions.length, icon: ClipboardList, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card text-center py-5">
            <s.icon className={'w-6 h-6 mx-auto mb-2 ' + s.color} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (tab === t.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white')}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className="bg-slate-600 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* EXAMS */}
          {tab === 'exams' && (
            <div className="space-y-4">
              {examAttempts.length === 0 ? (
                <div className="card text-center py-16">
                  <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No exam attempts yet.</p>
                </div>
              ) : examAttempts.map((a: any) => (
                <div key={a.id} className={'card border ' + (a.passed ? 'border-emerald-800/30' : a.submittedAt ? 'border-red-800/30' : 'border-slate-700/50')}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white">{a.exam?.title}</h3>
                        {a.submittedAt
                          ? a.passed
                            ? <span className="badge badge-success text-xs">Passed</span>
                            : <span className="badge bg-red-900/40 text-red-400 text-xs">Failed</span>
                          : <span className="badge badge-warning text-xs">In Progress</span>
                        }
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{a.exam?.course?.title}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{a.exam?.duration} mins
                        </span>
                        {a.score != null && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Score: {a.score}/{a.exam?.totalMarks}
                          </span>
                        )}
                        <span>{new Date(a.startedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {a.score != null && (
                      <div className="text-right ml-4">
                        <div className={'text-3xl font-bold ' + (a.passed ? 'text-emerald-400' : 'text-red-400')}>
                          {Math.round((a.score / a.exam?.totalMarks) * 100)}%
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5">
                          {a.score}/{a.exam?.totalMarks}
                        </div>
                      </div>
                    )}
                  </div>
                  {a.score != null && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className={'h-1.5 rounded-full ' + (a.passed ? 'bg-emerald-500' : 'bg-red-500')}
                          style={{ width: (a.score / a.exam?.totalMarks * 100) + '%' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0</span>
                        <span>Pass mark: {a.exam?.passMark}%</span>
                        <span>{a.exam?.totalMarks}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CATS */}
          {tab === 'cats' && (
            <div className="space-y-4">
              {catAttempts.length === 0 ? (
                <div className="card text-center py-16">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No CAT attempts yet.</p>
                </div>
              ) : catAttempts.map((a: any) => (
                <div key={a.id} className={'card border ' + (a.passed ? 'border-emerald-800/30' : 'border-red-800/30')}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white">{a.cat?.title}</h3>
                        {a.passed
                          ? <span className="badge badge-success text-xs">Passed</span>
                          : <span className="badge bg-red-900/40 text-red-400 text-xs">Failed</span>
                        }
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        {a.cat?.module?.course?.title} · {a.cat?.module?.title}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{a.cat?.duration} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Score: {a.score}/{a.cat?.totalMarks}
                        </span>
                        <span>{new Date(a.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={'text-3xl font-bold ' + (a.passed ? 'text-emerald-400' : 'text-red-400')}>
                        {Math.round((a.score / a.cat?.totalMarks) * 100)}%
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {a.score}/{a.cat?.totalMarks}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={'h-1.5 rounded-full ' + (a.passed ? 'bg-emerald-500' : 'bg-red-500')}
                        style={{ width: (a.score / a.cat?.totalMarks * 100) + '%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0</span>
                      <span>Pass mark: {a.cat?.passMark}%</span>
                      <span>{a.cat?.totalMarks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ASSIGNMENTS */}
          {tab === 'assignments' && (
            <div className="space-y-4">
              {assignmentSubmissions.length === 0 ? (
                <div className="card text-center py-16">
                  <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No assignment submissions yet.</p>
                </div>
              ) : assignmentSubmissions.map((a: any) => (
                <div key={a.id} className={'card border ' + (a.grade != null ? 'border-emerald-800/30' : 'border-amber-800/30')}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white">{a.assignment?.title}</h3>
                        <span className="badge badge-primary text-xs">{a.assignment?.type}</span>
                        {a.grade != null
                          ? <span className="badge badge-success text-xs">Graded</span>
                          : <span className="badge badge-warning text-xs">Pending</span>
                        }
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{a.assignment?.course?.title}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Submitted: {new Date(a.submittedAt).toLocaleDateString()}</span>
                        {a.grade != null && (
                          <span className="text-emerald-400 font-medium">
                            Grade: {a.grade}/{a.assignment?.totalMarks}
                          </span>
                        )}
                      </div>
                      {a.feedback && (
                        <div className="mt-2 bg-slate-800/50 rounded-xl px-3 py-2 text-sm text-slate-300">
                          💬 {a.feedback}
                        </div>
                      )}
                    </div>
                    {a.grade != null && (
                      <div className="text-right ml-4">
                        <div className="text-3xl font-bold text-emerald-400">
                          {Math.round((a.grade / a.assignment?.totalMarks) * 100)}%
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5">
                          {a.grade}/{a.assignment?.totalMarks}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
