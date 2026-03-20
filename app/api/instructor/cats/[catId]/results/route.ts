export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cat = await prisma.cAT.findUnique({
      where: { id: params.catId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        attempts: {
          where: { submittedAt: { not: null } },
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
        module: { select: { title: true, course: { select: { title: true } } } },
      },
    })

    if (!cat) return NextResponse.json({ error: 'CAT not found' }, { status: 404 })
    return NextResponse.json(cat)
  } catch (err) {
    console.error('[CAT_RESULTS]', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
