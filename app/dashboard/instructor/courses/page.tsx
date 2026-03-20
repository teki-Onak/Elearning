export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus, ChevronRight } from 'lucide-react'

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'INSTRUCTOR') redirect('/dashboard')

  const assignments = await prisma.courseInstructor.findMany({
    where: { instructorId: session.user.id },
    include: {
      course: {
        include: {
          modules: { include: { _count: { select: { lessons: true } } } },
          _count: { select: { enrollments: true } },
        },
      },
    },
  })

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Courses</h1>
        <p className="text-slate-400 mt-1">Courses assigned to you by the admin</p>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-20">
          <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">No courses assigned yet</h2>
          <p className="text-slate-400 text-sm">Ask the admin to assign you to a course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(({ course }) => (
            <div key={course.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-lg">{course.title}</h3>
                    <span className={`badge text-xs ${course.isPublished ? 'badge-success' : 'bg-slate-700 text-slate-300'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{course.modules.length} units</span>
                    <span>{course.modules.reduce((a, m) => a + m._count.lessons, 0)} lessons</span>
                    <span>{course._count.enrollments} students enrolled</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/instructor/courses/${course.id}`}
                  className="btn-primary flex items-center gap-2 ml-4"
                >
                  Manage <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Units preview */}
              {course.modules.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
                  {course.modules.slice(0, 3).map((mod, i) => (
                    <div key={mod.id} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">{i + 1}</span>
                      <span className="text-slate-300">{mod.title}</span>
                      <span className="text-slate-500 ml-auto">{mod._count.lessons} lessons</span>
                    </div>
                  ))}
                  {course.modules.length > 3 && (
                    <p className="text-xs text-slate-500 pl-9">+{course.modules.length - 3} more units</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
