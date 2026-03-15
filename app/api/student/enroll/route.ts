import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      ...(category ? { category } : {}),
      },
      include: {
        enrollments: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        hods: {
          include: { hod: { select: { name: true } } },
        },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(courses ?? [])
  } catch (err) {
    console.error('[ENROLL_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { courseId } = await req.json()
    if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    })
    if (existing) return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })

    const enrollment = await prisma.enrollment.create({
      data: { userId: session.user.id, courseId },
    })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    })

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Enrollment Successful 🎉',
        message: `You have successfully enrolled in "${course?.title}".`,
        type: 'course',
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (err) {
    console.error('[ENROLL_POST]', err)
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { courseId } = await req.json()

    await prisma.enrollment.delete({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ENROLL_DELETE]', err)
    return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 })
  }
}
