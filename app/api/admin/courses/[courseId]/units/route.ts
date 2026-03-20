export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const modules = await prisma.module.findMany({
      where: { courseId: params.courseId },
      include: {
        unitInstructors: {
          include: { instructor: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { lessons: true, assignments: true, cats: true } },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(modules ?? [])
  } catch (err) {
    console.error('[ADMIN_UNITS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
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

    const { title, description } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const count = await prisma.module.count({ where: { courseId: params.courseId } })

    const module = await prisma.module.create({
      data: {
        title,
        description,
        courseId: params.courseId,
        order: count + 1,
      },
    })

    return NextResponse.json(module, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_UNITS_POST]', err)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
