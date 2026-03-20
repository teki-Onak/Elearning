'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookMarked, ClipboardList, GraduationCap, Video, Loader2, ExternalLink, Clock, CheckCircle, XCircle, Play, BookCheck } from 'lucide-react'

type Tab = 'notes' | 'assignments' | 'cats' | 'online'

export default function StudentUnitPage() {
  const { unitId } = useParams()
  const router = useRouter()
  const [unit, setUnit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [catModal, setCatModal] = useState<any>(null)
  const [catQuestions, setCatQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [catResult, setCatResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [starting, setStarting] = useState(false)

  const fetchUnit = async () => {
    setLoading(true)
    const res = await fetch('/api/student/units/' + unitId)
    const data = await res.json()
    setUnit(data)
    setLoading(false)
  }

  useEffect(() => { fetchUnit() }, [unitId])

  useEffect(() => {
    if (!catModal || catResult) return
    if (timeLeft <= 0) { if (catModal) handleSubmitCAT(); return }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, catModal, catResult])

  const handleStartCAT = async (cat: any) => {
    setStarting(true)
    setCatResult(null)
    setAnswers({})
    try {
      const res = await fetch('/api/student/cats/' + cat.id + '/start', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCatQuestions(data.questions)
      setCatModal(cat)
      setTimeLeft(cat.duration * 60)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setStarting(false)
    }
  }

  const handleSubmitCAT = async () => {
    if (!catModal) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/student/cats/' + catModal.id + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      setCatResult(data)
      fetchUnit()
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return m + ':' + s
  }

  const tabs = [
    { key: 'notes', label: 'Notes', icon: BookMarked },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList },
    { key: 'cats', label: 'CATs', icon: GraduationCap },
    { key: 'online', label: 'Online Class', icon: Video },
  ]

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/dashboard/units')} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{unit?.title}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{unit?.course?.title}</p>
        </div>
      </div>

      {unit?.unitInstructors?.length > 0 && (
        <div className="card border border-slate-700/50 py-3 px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
            {unit.unitInstructors[0]?.instructor?.name[0]}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{unit.unitInstructors[0]?.instructor?.name}</p>
            <p className="text-slate-400 text-xs">Unit Instructor</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (activeTab === tab.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white')}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {!unit?.lessons?.length ? (
            <div className="card text-center py-16">
              <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No notes available yet.</p>
            </div>
           ) : unit.lessons.map((lesson: any, i: number) => {
            const isRead = lesson.progress?.[0]?.completed ?? false
            return (
              <div key={lesson.id} className={'card border ' + (isRead ? 'border-emerald-800/30 bg-emerald-900/5' : 'border-slate-700/50')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={'w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ' + (isRead ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-400')}>{i + 1}</span>
                      <h3 className="font-semibold text-white">{lesson.title}</h3>
                      {isRead && <span className="badge badge-success text-xs">Read</span>}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed ml-8 whitespace-pre-wrap">{lesson.content}</p>
                    {lesson.videoUrl && (
                      <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-3 ml-8 text-primary-400 hover:text-primary-300 text-sm">
                        <Video className="w-4 h-4" /> Watch Video <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await fetch('/api/student/progress/lesson', {
                        method: isRead ? 'DELETE' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lessonId: lesson.id }),
                      })
                      fetchUnit()
                    }}
                    className={'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ' + (isRead ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30' : 'bg-slate-800 text-slate-400 hover:text-white')}
                  >
                    <BookCheck className="w-3.5 h-3.5" />
                    {isRead ? 'Mark Unread' : 'Mark Read'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {!unit?.assignments?.length ? (
            <div className="card text-center py-16">
              <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No assignments for this unit yet.</p>
            </div>
          ) : unit.assignments.map((a: any) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{a.title}</h3>
                    <span className="badge text-xs badge-primary">{a.type}</span>
                    {a.submissions?.length > 0
                      ? <span className="badge text-xs badge-success">Submitted</span>
                      : <span className="badge text-xs badge-warning">Pending</span>
                    }
                  </div>
                  {a.description && <p className="text-slate-400 text-sm mb-2">{a.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    <span>{a.totalMarks} marks</span>
                    {a.submissions?.[0]?.grade != null && (
                      <span className="text-emerald-400 font-medium">Grade: {a.submissions[0].grade}/{a.totalMarks}</span>
                    )}
                  </div>
                </div>
                {!a.submissions?.length && (
                  <button onClick={() => router.push('/dashboard/assignments')} className="btn-primary text-sm ml-4">
                    Submit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cats' && (
        <div className="space-y-4">
          {!unit?.cats?.length ? (
            <div className="card text-center py-16">
              <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No CATs available yet.</p>
            </div>
          ) : unit.cats.map((cat: any) => {
            const attempt = cat.attempts?.[0]
            const done = !!attempt?.submittedAt
            return (
              <div key={cat.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{cat.title}</h3>
                      {done
                        ? attempt.passed
                          ? <span className="badge text-xs badge-success">Passed</span>
                          : <span className="badge text-xs bg-red-900/40 text-red-400">Failed</span>
                        : <span className="badge text-xs badge-warning">Not Attempted</span>
                      }
                    </div>
                    {cat.description && <p className="text-slate-400 text-sm mb-2">{cat.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cat.duration} mins</span>
                      <span>{cat.totalMarks} marks</span>
                      <span>Pass: {cat.passMark}%</span>
                      <span>{cat._count?.questions ?? 0} questions</span>
                      {done && <span className="text-emerald-400 font-medium">Score: {attempt.score}/{cat.totalMarks}</span>}
                    </div>
                  </div>
                  {!done ? (
                    <button onClick={() => handleStartCAT(cat)} disabled={starting} className="btn-primary flex items-center gap-2 text-sm ml-4">
                      {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Start CAT
                    </button>
                  ) : (
                    <div className="ml-4">
                      {attempt.passed ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'online' && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-primary-400" />
            <h2 className="text-white font-semibold">Online Class</h2>
          </div>
          {unit?.onlineClassLink ? (
            <div className="space-y-4">
              {unit.onlineClassDate && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Scheduled for</p>
                  <p className="text-white font-semibold mt-1">
                    {new Date(unit.onlineClassDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              <a href={unit.onlineClassLink} target="_blank" rel="noreferrer" className="btn-primary flex items-center justify-center gap-2 w-full">
                <Video className="w-4 h-4" /> Join Online Class <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No online class scheduled yet.</p>
            </div>
          )}
        </div>
      )}

      {catModal && !catResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-white">{catModal.title}</h2>
                <p className="text-slate-400 text-sm">{catQuestions.length} questions · {catModal.totalMarks} marks</p>
              </div>
              <div className={'text-2xl font-bold font-mono ' + (timeLeft < 60 ? 'text-red-400' : 'text-primary-400')}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {catQuestions.map((q, i) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-white font-medium">{q.text}</p>
                  </div>
                  {q.type === 'SHORT_ANSWER' ? (
                    <textarea
                      className="input w-full h-20 resize-none ml-8"
                      placeholder="Your answer..."
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2 ml-8">
                      {q.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={'px-3 py-2 rounded-xl text-sm text-left transition-all ' + (answers[q.id] === opt ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-800">
              <button onClick={handleSubmitCAT} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Submit CAT
              </button>
            </div>
          </div>
        </div>
      )}

      {catResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className={'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ' + (catResult.passed ? 'bg-emerald-500/20' : 'bg-red-500/20')}>
              {catResult.passed ? <CheckCircle className="w-10 h-10 text-emerald-400" /> : <XCircle className="w-10 h-10 text-red-400" />}
            </div>
            <h2 className="text-white font-bold text-2xl mb-1">{catResult.passed ? 'Passed!' : 'Not Passed'}</h2>
            <p className="text-slate-400 mb-4">Your CAT has been submitted</p>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <div className="text-4xl font-bold text-white mb-1">{catResult.percentage}%</div>
              <div className="text-slate-400 text-sm">Score: {catResult.score}/{catModal?.totalMarks}</div>
            </div>
            <button onClick={() => { setCatModal(null); setCatResult(null) }} className="btn-primary w-full">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
