export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!dbUser || dbUser.role !== 'INSTRUCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, message, unitId } = await req.json()
    if (!title || !message) return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })

    // Verify instructor is assigned to this unit
    const assignment = await prisma.unitInstructor.findFirst({
      where: { instructorId: session.user.id, moduleId: unitId },
    })
    if (!assignment) return NextResponse.json({ error: 'You are not assigned to this unit' }, { status: 403 })

    // Get the course for this unit
    const module = await prisma.module.findUnique({
      where: { id: unitId },
      select: { courseId: true, title: true },
    })
    if (!module) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })

    // Get all enrolled students in this course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: module.courseId, status: 'ACTIVE' },
      select: { userId: true },
    })

    if (enrollments.length === 0) return NextResponse.json({ error: 'No students enrolled in this unit' }, { status: 400 })

    // Send notifications to all enrolled students
    await prisma.notification.createMany({
      data: enrollments.map(e => ({
        userId: e.userId,
        title,
        message: `[${module.title}] ${message}`,
        type: 'announcement',
      })),
    })

    return NextResponse.json({ success: true, sent: enrollments.length })
  } catch (err) {
    console.error('[INSTRUCTOR_ANNOUNCEMENT]', err)
    return NextResponse.json({ error: 'Failed to send announcement' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get all units assigned to this instructor
    const units = await prisma.unitInstructor.findMany({
      where: { instructorId: session.user.id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: { select: { title: true } },
          },
        },
      },
    })

    return NextResponse.json(units.map(u => ({
      id: u.module.id,
      title: u.module.title,
      courseName: u.module.course.title,
    })))
  } catch (err) {
    console.error('[INSTRUCTOR_UNITS]', err)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}
