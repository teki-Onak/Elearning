import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || !['ADMIN', 'HOD'].includes(dbUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { instructorId } = await req.json()
    if (!instructorId) return NextResponse.json({ error: 'Missing instructorId' }, { status: 400 })

    const assignment = await prisma.unitInstructor.upsert({
      where: { moduleId_instructorId: { moduleId: params.unitId, instructorId } },
      update: {},
      create: { moduleId: params.unitId, instructorId },
    })

    const module = await prisma.module.findUnique({
      where: { id: params.unitId },
      include: { course: { select: { title: true } } },
    })

    await prisma.notification.create({
      data: {
        userId: instructorId,
        title: 'Unit Assigned 📚',
        message: `You have been assigned to unit "${module?.title}" in course "${module?.course?.title}".`,
        type: 'course',
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (err) {
    console.error('[UNIT_ASSIGN]', err)
    return NextResponse.json({ error: 'Failed to assign instructor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { instructorId } = await req.json()

    await prisma.unitInstructor.delete({
      where: { moduleId_instructorId: { moduleId: params.unitId, instructorId } },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove instructor' }, { status: 500 })
  }
}
