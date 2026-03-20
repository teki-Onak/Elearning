export const dynamic = 'force-dynamic'
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

    const exams = await prisma.exam.findMany({
      where: { instructorId: session.user.id },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(exams ?? [])
  } catch (err) {
    console.error('[INSTRUCTOR_EXAMS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
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
    const { title, description, courseId, duration, totalMarks, passMark, startTime, endTime } = body
    if (!title || !courseId || !startTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        courseId,
        duration: Number(duration),
        totalMarks: Number(totalMarks),
        passMark: Number(passMark),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
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
        title: `Exam Scheduled: ${title}`,
        message: `A new exam has been scheduled. Starts: ${new Date(startTime).toLocaleDateString()} — Duration: ${duration} mins`,
        type: 'course',
      })),
    })

    return NextResponse.json(exam, { status: 201 })
  } catch (err) {
    console.error('[INSTRUCTOR_EXAMS_POST]', err)
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
}
