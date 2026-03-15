import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const unit = await prisma.module.findUnique({
      where: { id: params.unitId },
      include: {
        course: { select: { id: true, title: true } },
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            progress: {
              where: { userId: session.user.id },
              select: { completed: true },
            },
          },
        },
        unitInstructors: {
          include: { instructor: { select: { name: true, email: true } } },
        },
        cats: {
          where: { isPublished: true },
          include: {
            attempts: {
              where: { studentId: session.user.id },
              select: { id: true, score: true, passed: true, submittedAt: true },
            },
            _count: { select: { questions: true } },
          },
        },
        assignments: {
          where: { moduleId: params.unitId },
          include: {
            submissions: {
              where: { studentId: session.user.id },
              select: { id: true, grade: true, submittedAt: true },
            },
          },
        },
      },
    })

    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch (err) {
    console.error('[STUDENT_UNIT_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}
