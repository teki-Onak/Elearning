export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify this person is HoD of this course
    const hodAssignment = await prisma.courseHoD.findUnique({
      where: { courseId_hodId: { courseId: params.courseId, hodId: session.user.id } },
    })
    if (!hodAssignment) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const count = await prisma.module.count({ where: { courseId: params.courseId } })

    const module = await prisma.module.create({
      data: { title, description, courseId: params.courseId, order: count + 1 },
    })

    return NextResponse.json(module, { status: 201 })
  } catch (err) {
    console.error('[HOD_UNIT_POST]', err)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
