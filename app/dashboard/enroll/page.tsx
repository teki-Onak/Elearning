'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Loader2, Search, Users, Layers, GraduationCap, CheckCircle, Plus, X } from 'lucide-react'

export default function EnrollPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

const fetchCourses = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    const res = await fetch('/api/student/enroll?' + params.toString())
    const data = await res.json()
    const list = Array.isArray(data) ? data : []
    setCourses(list)
    // Extract unique categories
    const cats = [...new Set(list.map((c: any) => c.category).filter(Boolean))] as string[]
    setCategories(cats)
    setLoading(false)
  }

  useEffect(() => { fetchCourses() }, [search, category])

  useEffect(() => { fetchCourses() }, [])

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId)
    setMessage(null)
    try {
      const res = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage({ type: 'success', text: 'Successfully enrolled!' })
      fetchCourses()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setEnrolling(null)
    }
  }

  const handleUnenroll = async (courseId: string) => {
    setEnrolling(courseId)
    setMessage(null)
    try {
      const res = await fetch('/api/student/enroll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      if (!res.ok) throw new Error('Failed to unenroll')
      setMessage({ type: 'success', text: 'Unenrolled successfully.' })
      fetchCourses()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setEnrolling(null)
    }
  }

  const enrolled = courses.filter(c => c.enrollments?.length > 0)
  const available = courses.filter(c => c.enrollments?.length === 0)

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Course Enrollment</h1>
        <p className="text-slate-400 mt-1">Browse and enroll in available courses</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
          message.type === 'success' ? 'bg-emerald-900/30 border border-emerald-800 text-emerald-400' : 'bg-red-900/30 border border-red-800 text-red-400'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search courses..."
            className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {categories.length > 0 && (
          <select
            className="input text-sm"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        {(search || category) && (
          <button
            onClick={() => { setSearch(''); setCategory('') }}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Enrolled Courses */}
          {enrolled.length > 0 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Enrolled Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolled.map(course => (
                  <div key={course.id} className="card border border-emerald-800/30 bg-emerald-900/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{course.title}</h3>
                          <span className="badge badge-success text-xs">Enrolled</span>
                        </div>
                        {course.description && (
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />{course._count?.modules ?? 0} units
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />{course._count?.enrollments ?? 0} students
                          </span>
                          {course.hods?.[0] && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />{course.hods[0].hod?.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnenroll(course.id)}
                        disabled={enrolling === course.id}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      >
                        {enrolling === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Unenroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Courses */}
          {available.length > 0 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-400" /> Available Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {available.map(course => (
                  <div key={course.id} className="card hover:border-primary-500/30 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{course.title}</h3>
                        {course.description && (
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />{course._count?.modules ?? 0} units
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />{course._count?.enrollments ?? 0} students
                          </span>
                          {course.hods?.[0] && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />{course.hods[0].hod?.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling === course.id}
                        className="btn-primary flex items-center gap-1 text-sm flex-shrink-0"
                      >
                        {enrolling === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Enroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses.length === 0 && (
            <div className="card text-center py-20">
              <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
              <h2 className="text-white font-semibold text-lg mb-2">No courses found</h2>
              <p className="text-slate-400 text-sm">Try a different search or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
