'use client'

import { useEffect, useState } from 'react'
import { Loader2, GraduationCap, ClipboardList, BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react'

type ResultTab = 'exams' | 'cats' | 'assignments'

export default function AdminResultsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ResultTab>('exams')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/admin/results')
      const d = await res.json()
      setData(d)
      setLoading(false)
    }
    load()
  }, [])

  const filterBySearch = (items: any[], keys: string[]) => {
    if (!search.trim()) return items
    return items.filter(item =>
      keys.some(key => {
        const val = key.split('.').reduce((o, k) => o?.[k], item)
        return String(val ?? '').toLowerCase().includes(search.toLowerCase())
      })
    )
  }

  const examResults = filterBySearch(data?.examAttempts ?? [], ['student.name', 'student.email', 'exam.title', 'exam.course.title'])
  const catResults = filterBySearch(data?.catAttempts ?? [], ['student.name', 'student.email', 'cat.title'])
  const assignResults = filterBySearch(data?.assignmentSubmissions ?? [], ['student.name', 'student.email', 'assignment.title'])

  const tabs = [
    { key: 'exams', label: 'Exams', icon: GraduationCap, count: data?.examAttempts?.length ?? 0 },
    { key: 'cats', label: 'CATs', icon: BookOpen, count: data?.catAttempts?.length ?? 0 },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList, count: data?.assignmentSubmissions?.length ?? 0 },
  ]

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">All Results</h1>
        <p className="text-slate-400 mt-1">View all student exam, CAT and assignment results</p>
      </div>

      {/* Search */}
      <input
        type="text"
        className="input w-full max-w-sm"
        placeholder="Search by student, course or title..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as ResultTab)}
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
          {/* EXAM RESULTS */}
          {tab === 'exams' && (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead className="border-b border-slate-800">
                  <tr className="text-left">
                    <th className="p-4 text-slate-400 text-sm font-medium">Student</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Exam</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Course</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Score</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No exam results found.</td></tr>
                  ) : examResults.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <p className="text-white text-sm font-medium">{r.student?.name}</p>
                        <p className="text-slate-400 text-xs">{r.student?.email}</p>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{r.exam?.title}</td>
                      <td className="p-4 text-slate-400 text-sm">{r.exam?.course?.title}</td>
                      <td className="p-4">
                        {r.score != null
                          ? <span className="text-white font-medium text-sm">{r.score}/{r.exam?.totalMarks}</span>
                          : <span className="text-slate-500 text-sm">—</span>
                        }
                      </td>
                      <td className="p-4">
                        {r.submittedAt
                          ? r.passed
                            ? <span className="badge badge-success text-xs flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Passed</span>
                            : <span className="badge bg-red-900/40 text-red-400 text-xs flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" />Failed</span>
                          : <span className="badge badge-warning text-xs flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />In Progress</span>
                        }
                      </td>
                      <td className="p-4 text-slate-400 text-xs">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : new Date(r.startedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CAT RESULTS */}
          {tab === 'cats' && (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead className="border-b border-slate-800">
                  <tr className="text-left">
                    <th className="p-4 text-slate-400 text-sm font-medium">Student</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">CAT</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Unit</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Score</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {catResults.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No CAT results found.</td></tr>
                  ) : catResults.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <p className="text-white text-sm font-medium">{r.student?.name}</p>
                        <p className="text-slate-400 text-xs">{r.student?.email}</p>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{r.cat?.title}</td>
                      <td className="p-4 text-slate-400 text-sm">{r.cat?.module?.title}</td>
                      <td className="p-4">
                        <span className="text-white font-medium text-sm">{r.score}/{r.cat?.totalMarks}</span>
                      </td>
                      <td className="p-4">
                        {r.passed
                          ? <span className="badge badge-success text-xs flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Passed</span>
                          : <span className="badge bg-red-900/40 text-red-400 text-xs flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" />Failed</span>
                        }
                      </td>
                      <td className="p-4 text-slate-400 text-xs">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ASSIGNMENT RESULTS */}
          {tab === 'assignments' && (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead className="border-b border-slate-800">
                  <tr className="text-left">
                    <th className="p-4 text-slate-400 text-sm font-medium">Student</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Assignment</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Course</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Grade</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="p-4 text-slate-400 text-sm font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {assignResults.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No assignment submissions found.</td></tr>
                  ) : assignResults.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <p className="text-white text-sm font-medium">{r.student?.name}</p>
                        <p className="text-slate-400 text-xs">{r.student?.email}</p>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{r.assignment?.title}</td>
                      <td className="p-4 text-slate-400 text-sm">{r.assignment?.course?.title}</td>
                      <td className="p-4">
                        {r.grade != null
                          ? <span className="text-emerald-400 font-medium text-sm">{r.grade}/{r.assignment?.totalMarks}</span>
                          : <span className="text-amber-400 text-sm">Not graded</span>
                        }
                      </td>
                      <td className="p-4">
                        {r.grade != null
                          ? <span className="badge badge-success text-xs">Graded</span>
                          : <span className="badge badge-warning text-xs">Pending</span>
                        }
                      </td>
                      <td className="p-4 text-slate-400 text-xs">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
