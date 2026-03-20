export const dynamic = 'force-dynamic'
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
        lessons: { orderBy: { order: 'asc' } },
        assignments: {
           where: { moduleId: params.unitId },
           include: { _count: { select: { submissions: true } } },
           orderBy: { createdAt: 'desc' },
        },
        cats: {
          include: { _count: { select: { attempts: true, questions: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch (err) {
    console.error('[INSTRUCTOR_UNIT_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const unit = await prisma.module.update({
      where: { id: params.unitId },
      data: body,
    })
    return NextResponse.json(unit)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}
