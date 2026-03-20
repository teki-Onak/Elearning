export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    const course = await prisma.course.findUnique({
       where: { id: params.courseId },
       include: {
         hods: {
           include: { hod: { select: { id: true, name: true, email: true } } },
         },
       },
     })

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    // Check enrollment if user is logged in
    let isEnrolled = false
    let progress: any[] = []

    if (session?.user?.id) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: params.courseId } },
      })
      isEnrolled = !!enrollment

      if (isEnrolled) {
        progress = await prisma.progress.findMany({
          where: { userId: session.user.id },
        })
      }
    }

    return NextResponse.json({ ...course, isEnrolled, progress })
  } catch (err) {
    console.error('[COURSE_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch course.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || !['INSTRUCTOR', 'ADMIN'].includes(dbUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const course = await prisma.course.update({
      where: { id: params.courseId },
      data: body,
    })

    return NextResponse.json(course)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update course.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await prisma.course.delete({ where: { id: params.courseId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete course.' }, { status: 500 })
  }
}
