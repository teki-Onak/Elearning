import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get all courses student is enrolled in
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
            unitInstructors: {
              include: { instructor: { select: { name: true } } },
            },
            _count: { select: { lessons: true, assignments: true, cats: true } },
          },
        },
      },
    })

    return NextResponse.json(courses ?? [])
  } catch (err) {
    console.error('[STUDENT_UNITS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}
