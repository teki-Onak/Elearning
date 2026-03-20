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
      include: { _count: { select: { questions: true, attempts: true } } },
    })

    if (!cat) return NextResponse.json({ error: 'CAT not found' }, { status: 404 })
    return NextResponse.json(cat)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch CAT' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const cat = await prisma.cAT.update({
      where: { id: params.catId },
      data: body,
    })

    return NextResponse.json(cat)
  } catch (err) {
    console.error('[CAT_PATCH]', err)
    return NextResponse.json({ error: 'Failed to update CAT' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.cAT.delete({ where: { id: params.catId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete CAT' }, { status: 500 })
  }
}
