'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  BookOpen, Clock, Users, Play, ChevronDown, ChevronRight,
  CheckCircle, Lock, FileText, Download, Loader2
} from 'lucide-react'
import { formatDuration, calcProgress } from '@/lib/utils'

interface Props {
  course: any
  isEnrolled: boolean
  progress: any[]
  totalLessons: number
  completedLessons: number
  isLoggedIn: boolean
}

export default function CourseDetail({ course, isEnrolled, progress, totalLessons, completedLessons, isLoggedIn }: Props) {
  const router = useRouter()
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([course.modules[0]?.id]))
  const [enrolling, setEnrolling] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)

  const completedIds = new Set(progress.filter(p => p.completed).map(p => p.lessonId))
  const progressPercent = calcProgress(completedLessons, totalLessons)

  const handleEnroll = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setEnrolling(true)
    const res = await fetch(`/api/courses/${course.id}/enroll`, { method: 'POST' })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error)
    } else {
      toast.success('Enrolled! Start learning now 🚀')
      router.refresh()
    }
    setEnrolling(false)
  }

  const handleMarkComplete = async () => {
    if (!activeLesson) return
    setMarkingComplete(true)
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: activeLesson.id }),
    })
    if (res.ok) {
      toast.success('Lesson marked as complete! ✅')
      router.refresh()
    }
    setMarkingComplete(false)
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  return (
    <div className="max-w-6xl">
      {!activeLesson ? (
        // Course Overview
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex gap-2 mb-3">
                <span className="badge-primary">{course.level}</span>
                <span className="badge bg-slate-700 text-slate-300">{course.category}</span>
              </div>
              <h1 className="font-display text-4xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-slate-300 text-lg leading-relaxed">{course.description}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{formatDuration(course.duration)}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" />{course._count.enrollments} students</span>
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" />{totalLessons} lessons</span>
            </div>

            {isEnrolled && (
              <div className="card">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">Your Progress</span>
                  <span className="text-sm text-primary-400">{progressPercent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-2">{completedLessons} of {totalLessons} lessons completed</p>
              </div>
            )}

            {/* Curriculum */}
            <div>
              <h2 className="section-title mb-4">Course Curriculum</h2>
              <div className="space-y-2">
                {course.modules.map((mod: any) => (
                  <div key={mod.id} className="card p-0 overflow-hidden">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className="font-medium text-white">{mod.title}</span>
                        <span className="text-xs text-slate-400">{mod.lessons.length} lessons</span>
                      </div>
                    </button>

                    {expandedModules.has(mod.id) && (
                      <div className="border-t border-slate-700/50">
                        {mod.lessons.map((lesson: any) => (
                          <button
                            key={lesson.id}
                            onClick={() => isEnrolled && setActiveLesson(lesson)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/20 transition-colors text-left border-b border-slate-700/30 last:border-0 ${!isEnrolled ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className={`w-5 h-5 flex-shrink-0 ${completedIds.has(lesson.id) ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {completedIds.has(lesson.id) ? <CheckCircle className="w-5 h-5" /> : isEnrolled ? <Play className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </div>
                            <span className={`text-sm flex-1 ${completedIds.has(lesson.id) ? 'text-emerald-300 line-through' : 'text-slate-300'}`}>
                              {lesson.title}
                            </span>
                            {lesson.duration && (
                              <span className="text-xs text-slate-500">{lesson.duration}m</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card sticky top-24">
              <div className="h-32 bg-gradient-to-br from-primary-900/60 to-accent-900/40 rounded-xl mb-4 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary-400/60" />
              </div>

              {isEnrolled ? (
                <button
                  onClick={() => setActiveLesson(course.modules[0]?.lessons[0])}
                  className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
                >
                  <Play className="w-4 h-4" />
                  {completedLessons > 0 ? 'Continue Learning' : 'Start Course'}
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
                >
                  {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                </button>
              )}

              <div className="space-y-2.5 text-sm text-slate-400">
                <div className="flex justify-between"><span>Duration</span><span className="text-white">{formatDuration(course.duration)}</span></div>
                <div className="flex justify-between"><span>Lessons</span><span className="text-white">{totalLessons}</span></div>
                <div className="flex justify-between"><span>Level</span><span className="text-white">{course.level}</span></div>
                <div className="flex justify-between"><span>Students</span><span className="text-white">{course._count.enrollments}</span></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Lesson Viewer
        <div className="grid lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveLesson(null)} className="btn-ghost text-sm">← Back to Course</button>
            </div>
            <div className="card">
              <h1 className="font-display text-2xl font-bold text-white mb-6">{activeLesson.title}</h1>
              {activeLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-xl mb-6 flex items-center justify-center border border-slate-700">
                  <video src={activeLesson.videoUrl} controls className="w-full h-full rounded-xl" />
                </div>
              )}
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                {activeLesson.content}
              </div>

              {activeLesson.resources?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-3">Resources</h3>
                  <div className="space-y-2">
                    {activeLesson.resources.map((r: any) => (
                      <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                        <Download className="w-4 h-4" />
                        {r.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!completedIds.has(activeLesson.id) && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <button onClick={handleMarkComplete} disabled={markingComplete} className="btn-primary flex items-center gap-2">
                    {markingComplete ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Mark as Complete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lesson list sidebar */}
          <div className="space-y-2 max-h-screen overflow-y-auto">
            {course.modules.map((mod: any) => (
              <div key={mod.id}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">{mod.title}</p>
                {mod.lessons.map((lesson: any) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all mb-1 ${
                      activeLesson.id === lesson.id ? 'bg-primary-600/20 text-primary-300 border border-primary-500/20'
                      : completedIds.has(lesson.id) ? 'text-emerald-400 hover:bg-slate-800'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {completedIds.has(lesson.id) ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <Play className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
