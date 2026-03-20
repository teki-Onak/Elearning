export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    })

    const courseIds = enrollments.map(e => e.courseId)

    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { select: { id: true } },
            cats: {
              include: {
                attempts: {
                  where: { studentId: session.user.id, submittedAt: { not: null } },
                  select: { score: true, passed: true },
                },
              },
            },
            assignments: {
              include: {
                submissions: {
                  where: { studentId: session.user.id },
                  select: { id: true, grade: true },
                },
              },
            },
          },
        },
      },
    })

    // Calculate progress per unit
    const result = await Promise.all(courses.map(async course => {
      const units = await Promise.all(course.modules.map(async unit => {
        const lessonIds = unit.lessons.map(l => l.id)
        const completedLessons = lessonIds.length > 0
          ? await prisma.progress.count({
              where: { userId: session.user.id, lessonId: { in: lessonIds }, completed: true },
            })
          : 0

        const totalLessons = lessonIds.length
        const notesProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

        const catsAttempted = unit.cats.filter(c => c.attempts.length > 0).length
        const catsPassed = unit.cats.filter(c => c.attempts.some(a => a.passed)).length
        const totalCats = unit.cats.length

        const assignsSubmitted = unit.assignments.filter(a => a.submissions.length > 0).length
        const totalAssignments = unit.assignments.length

        const overallProgress = Math.round(
          ((completedLessons + catsAttempted + assignsSubmitted) /
          Math.max(totalLessons + totalCats + totalAssignments, 1)) * 100
        )

        return {
          id: unit.id,
          title: unit.title,
          overallProgress,
          notes: { completed: completedLessons, total: totalLessons, progress: notesProgress },
          cats: { attempted: catsAttempted, passed: catsPassed, total: totalCats },
          assignments: { submitted: assignsSubmitted, total: totalAssignments },
        }
      }))

      const courseProgress = units.length > 0
        ? Math.round(units.reduce((sum, u) => sum + u.overallProgress, 0) / units.length)
        : 0

      return { id: course.id, title: course.title, courseProgress, units }
    }))

    return NextResponse.json(result ?? [])
  } catch (err) {
    console.error('[UNIT_PROGRESS]', err)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
