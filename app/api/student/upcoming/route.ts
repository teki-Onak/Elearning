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

    const now = new Date()

    const [exams, cats, assignments] = await Promise.all([
      prisma.exam.findMany({
        where: {
          courseId: { in: courseIds },
          isPublished: true,
          startTime: { gte: now },
          attempts: { none: { studentId: session.user.id } },
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          duration: true,
          course: { select: { title: true } },
        },
        orderBy: { startTime: 'asc' },
        take: 10,
      }),
      prisma.cAT.findMany({
        where: {
          courseId: { in: courseIds },
          isPublished: true,
          startTime: { gte: now },
          attempts: { none: { studentId: session.user.id } },
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          duration: true,
          module: { select: { title: true, course: { select: { title: true } } } },
        },
        orderBy: { startTime: 'asc' },
        take: 10,
      }),
      prisma.assignment.findMany({
        where: {
          courseId: { in: courseIds },
          dueDate: { gte: now },
          submissions: { none: { studentId: session.user.id } },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          course: { select: { title: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ])

    return NextResponse.json({ exams, cats, assignments })
  } catch (err) {
    console.error('[UPCOMING]', err)
    return NextResponse.json({ error: 'Failed to fetch upcoming' }, { status: 500 })
  }
}
