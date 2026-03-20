export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { courseId, instructorId } = await req.json()
    if (!courseId || !instructorId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const assignment = await prisma.courseInstructor.upsert({
      where: { courseId_instructorId: { courseId, instructorId } },
      update: {},
      create: { courseId, instructorId },
    })

    await prisma.notification.create({
      data: {
        userId: instructorId,
        title: 'Course Assigned 🎓',
        message: 'You have been assigned to a new course. Check your instructor portal.',
        type: 'course',
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (err) {
    console.error('[ASSIGN_INSTRUCTOR]', err)
    return NextResponse.json({ error: 'Failed to assign instructor' }, { status: 500 })
  }
}
