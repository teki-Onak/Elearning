'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { Clock, BookOpen, CheckCircle, Loader2, X, AlertTriangle, Trophy } from 'lucide-react'

export default function StudentExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeExam, setActiveExam] = useState<any | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [loadingExam, setLoadingExam] = useState(false)

  const fetchExams = async () => {
    setLoading(true)
    const res = await fetch('/api/student/exams')
    const data = await res.json()
    setExams(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchExams() }, [])

  // Countdown timer
  useEffect(() => {
    if (!activeExam || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [activeExam, timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const startExam = async (exam: any) => {
    setLoadingExam(true)
    const res = await fetch(`/api/student/exams/${exam.id}/start`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setQuestions(data.questions || [])
      setAnswers({})
      setTimeLeft(exam.duration * 60)
      setActiveExam(exam)
      setResult(null)
    }
    setLoadingExam(false)
  }

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!activeExam) return
    setSubmitting(true)
    const res = await fetch(`/api/student/exams/${activeExam.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    if (res.ok) {
      setResult(data)
      setActiveExam(null)
      fetchExams()
    }
    setSubmitting(false)
  }, [activeExam, answers])

  const timerColor = timeLeft < 300 ? 'text-red-400' : timeLeft < 600 ? 'text-amber-400' : 'text-emerald-400'

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Show result screen
  if (result) {
    return (
      <div className="max-w-lg mx-auto mt-20 animate-fade-in">
        <div className="card text-center py-12">
          <div className={`w-20 h-20 rounded-full ${result.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center mx-auto mb-6`}>
            {result.passed
              ? <Trophy className="w-10 h-10 text-emerald-400" />
              : <X className="w-10 h-10 text-red-400" />
            }
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            {result.passed ? 'Congratulations! 🎉' : 'Better luck next time'}
          </h2>
          <p className="text-slate-400 mb-6">Exam submitted successfully</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{result.score}%</div>
              <div className="text-xs text-slate-400 mt-1">Score</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{result.correct}</div>
              <div className="text-xs text-slate-400 mt-1">Correct</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className={`text-2xl font-bold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.passed ? 'Pass' : 'Fail'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Result</div>
            </div>
          </div>
          <button onClick={() => setResult(null)} className="btn-primary">
            Back to Exams
          </button>
        </div>
      </div>
    )
  }

  // Show active exam
  if (activeExam) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Exam Header */}
        <div className="card flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">{activeExam.title}</h2>
            <p className="text-slate-400 text-sm">{questions.length} questions · {activeExam.totalMarks} marks</p>
          </div>
          <div className={`flex items-center gap-2 text-2xl font-bold font-mono ${timerColor}`}>
            <Clock className="w-6 h-6" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {timeLeft < 300 && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Less than 5 minutes remaining! Submit your answers soon.
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.id} className="card">
              <p className="text-white font-medium mb-4">
                <span className="text-slate-400 mr-2">Q{i + 1}.</span>
                {q.text}
                <span className="text-xs text-slate-500 ml-2">({q.marks} mark{q.marks > 1 ? 's' : ''})</span>
              </p>
              <div className="space-y-2">
                {q.options.map((opt: string, j: number) => (
                  <button
                    key={j}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                      answers[q.id] === opt
                        ? 'border-primary-500 bg-primary-500/10 text-white'
                        : 'border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium mr-2 text-slate-400">{String.fromCharCode(65 + j)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="card flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            {Object.keys(answers).length} of {questions.length} answered
          </p>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Submit Exam
          </button>
        </div>
      </div>
    )
  }

  // Exams list
  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Exams</h1>
        <p className="text-slate-400 mt-1">View and take your scheduled exams</p>
      </div>

      {exams.length === 0 ? (
        <div className="card text-center py-20">
          <Clock className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No exams scheduled</h2>
          <p className="text-slate-400 text-sm">Your instructor hasn't scheduled any exams yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => {
            const attempted = exam.attempts.length > 0
            const attempt = exam.attempts[0]
            const now = new Date()
            const startTime = new Date(exam.startTime)
            const endTime = exam.endTime ? new Date(exam.endTime) : null
            const isAvailable = now >= startTime && (!endTime || now <= endTime)
            const isUpcoming = now < startTime

            return (
              <div key={exam.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-white">{exam.title}</h3>
                      {attempted && <span className={`badge text-xs ${attempt.passed ? 'badge-success' : 'badge-error'}`}>{attempt.passed ? 'Passed' : 'Failed'}</span>}
                      {!attempted && isAvailable && <span className="badge text-xs badge-success">Available Now</span>}
                      {!attempted && isUpcoming && <span className="badge text-xs badge-warning">Upcoming</span>}
                      {!attempted && !isAvailable && !isUpcoming && <span className="badge text-xs bg-slate-700 text-slate-300">Closed</span>}
                    </div>
                    {exam.description && <p className="text-slate-400 text-sm mb-3">{exam.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{exam.course?.title}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exam.duration} mins</span>
                      <span>{exam._count?.questions ?? 0} questions</span>
                      <span>Pass: {exam.passMark}%</span>
                      <span>Starts: {new Date(exam.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {attempted && (
                      <p className="text-sm mt-2">
                        <span className={attempt.passed ? 'text-emerald-400' : 'text-red-400'}>
                          Score: {attempt.score}% — {attempt.passed ? 'Passed ✓' : 'Failed ✗'}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    {!attempted && isAvailable && (
                      <button
                        onClick={() => startExam(exam)}
                        disabled={loadingExam}
                        className="btn-primary flex items-center gap-2"
                      >
                        {loadingExam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                        Start Exam
                      </button>
                    )}
                    {attempted && (
                      <div className={`text-center px-4 py-2 rounded-xl ${attempt.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <div className="text-lg font-bold">{attempt.score}%</div>
                        <div className="text-xs">{attempt.passed ? 'Passed' : 'Failed'}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
