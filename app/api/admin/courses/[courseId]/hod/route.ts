export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
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

    const { hodId } = await req.json()
    if (!hodId) return NextResponse.json({ error: 'Missing hodId' }, { status: 400 })

    
    const hod = await prisma.courseHoD.upsert({
      where: { courseId_hodId: { courseId: params.courseId, hodId } },
      update: {},
      create: { courseId: params.courseId, hodId },
    })

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { title: true },
    })

    await prisma.notification.create({
      data: {
        userId: hodId,
        title: 'You are now Head of Department 🎓',
        message: `You have been assigned as HoD for "${course?.title}".`,
        type: 'course',
      },
    })

    return NextResponse.json(hod, { status: 201 })
  } catch (err) {
    console.error('[HOD_ASSIGN]', err)
    return NextResponse.json({ error: 'Failed to assign HoD' }, { status: 500 })
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

    const { hodId } = await req.json()

    await prisma.courseHoD.delete({
      where: { courseId_hodId: { courseId: params.courseId, hodId } },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[HOD_DELETE]', err)
    return NextResponse.json({ error: 'Failed to remove HoD' }, { status: 500 })
  }
}
