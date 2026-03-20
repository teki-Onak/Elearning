export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { BookOpen, Clock, Users, ChevronRight } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get user enrollments
  let enrolledIds = new Set<string>()
  if (session?.user?.id) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    })
    enrolledIds = new Set(enrollments.map(e => e.courseId))
  }

  const categories = Array.from(new Set(courses.map(c => c.category)))

  const levelColors: Record<string, string> = {
    BEGINNER: 'badge-success',
    INTERMEDIATE: 'badge-warning',
    ADVANCED: 'badge-error',
  }

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Browse Courses</h1>
        <p className="text-slate-400 mt-1">Explore our library of online learning courses</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        <button className="btn-primary text-sm px-4 py-1.5">All</button>
        {categories.map(cat => (
          <button key={cat} className="btn-secondary text-sm px-4 py-1.5">{cat}</button>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No courses available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="card-hover group flex flex-col">
              {/* Thumbnail placeholder */}
              <div className="h-36 bg-gradient-to-br from-primary-900/60 to-accent-900/40 rounded-xl mb-4 flex items-center justify-center border border-slate-700/30">
                <BookOpen className="w-10 h-10 text-primary-400/60" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className={`badge text-xs ${levelColors[course.level] || 'badge-primary'}`}>
                  {course.level}
                </span>
                <span className="text-xs text-slate-500">{course.category}</span>
              </div>

              <h3 className="font-display font-semibold text-white group-hover:text-primary-300 transition-colors mb-2 leading-snug">
                {course.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1 line-clamp-2">{course.description}</p>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(course.duration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {course._count.enrollments} students
                </span>
                <span className="ml-auto flex items-center gap-1 text-primary-400 group-hover:gap-2 transition-all">
                  {enrolledIds.has(course.id) ? 'Continue' : 'Enroll'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
