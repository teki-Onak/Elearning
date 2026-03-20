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
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    const result = await Promise.all(enrollments.map(async e => {
      const lessonIds = e.course.modules.flatMap(m => m.lessons.map(l => l.id))
      const completed = lessonIds.length > 0
        ? await prisma.progress.count({
            where: { userId: session.user.id, lessonId: { in: lessonIds }, completed: true },
          })
        : 0
      return {
        ...e,
        totalLessons: lessonIds.length,
        completedLessons: completed,
        progress: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0,
      }
    }))

    return NextResponse.json(result ?? [])
  } catch (err) {
    console.error('[STUDENT_COURSES]', err)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
