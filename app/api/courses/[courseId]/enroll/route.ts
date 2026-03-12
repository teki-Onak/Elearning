import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Please log in to enroll.' }, { status: 401 })

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: params.courseId } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in this course.' }, { status: 409 })
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: session.user.id, courseId: params.courseId },
    })

    // Notify
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Enrollment Confirmed ✅',
        message: 'You have successfully enrolled. Happy learning!',
        type: 'course',
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (err) {
    console.error('[ENROLL]', err)
    return NextResponse.json({ error: 'Enrollment failed.' }, { status: 500 })
  }
}
