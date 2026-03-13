import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || dbUser.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignments = await prisma.assignment.findMany({
      where: { instructorId: session.user.id },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(assignments ?? [])
  } catch (err) {
    console.error('[INSTRUCTOR_ASSIGNMENTS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || dbUser.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, type, courseId, moduleId, dueDate, totalMarks } = body
    if (!title || !courseId || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

const assignment = await prisma.assignment.create({
  data: {
    title,
    description,
    type,
    courseId,
    moduleId: moduleId || null,
    dueDate: new Date(dueDate),
    totalMarks: Number(totalMarks),
    instructorId: session.user.id,
  },
})
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true },
    })
    await prisma.notification.createMany({
      data: enrollments.map(e => ({
        userId: e.userId,
        title: `New ${type}: ${title}`,
        message: `A new ${type.toLowerCase()} has been posted. Due: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'course',
      })),
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (err) {
    console.error('[INSTRUCTOR_ASSIGNMENTS_POST]', err)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}
