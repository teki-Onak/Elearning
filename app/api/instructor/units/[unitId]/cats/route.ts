import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cats = await prisma.cAT.findMany({
      where: { moduleId: params.unitId },
      include: { _count: { select: { attempts: true, questions: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(cats ?? [])
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch CATs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, description, duration, totalMarks, passMark, startTime, endTime } = body
    if (!title || !startTime) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const unit = await prisma.module.findUnique({
      where: { id: params.unitId },
      select: { courseId: true },
    })

    const cat = await prisma.cAT.create({
      data: {
        title,
        description,
        moduleId: params.unitId,
        courseId: unit!.courseId,
        instructorId: session.user.id,
        duration: Number(duration) || 30,
        totalMarks: Number(totalMarks) || 30,
        passMark: Number(passMark) || 50,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
      },
    })

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: unit!.courseId },
      select: { userId: true },
    })

    await prisma.notification.createMany({
      data: enrollments.map(e => ({
        userId: e.userId,
        title: `CAT Scheduled: ${title}`,
        message: `A new CAT has been scheduled. Starts: ${new Date(startTime).toLocaleDateString()} — Duration: ${duration} mins`,
        type: 'course',
      })),
    })

    return NextResponse.json(cat, { status: 201 })
  } catch (err) {
    console.error('[CAT_POST]', err)
    return NextResponse.json({ error: 'Failed to create CAT' }, { status: 500 })
  }
}
