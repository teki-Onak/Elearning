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

    const exams = await prisma.exam.findMany({
      where: {
        courseId: { in: courseIds },
        isPublished: true,
      },
      include: {
        course: { select: { id: true, title: true } },
        attempts: {
          where: { studentId: session.user.id },
          select: { id: true, score: true, passed: true, submittedAt: true },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(exams ?? [])
  } catch (err) {
    console.error('[STUDENT_EXAMS]', err)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}
