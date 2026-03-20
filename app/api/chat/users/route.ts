export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const users = await prisma.user.findMany({
      where: { id: { not: session.user.id } },
      select: { id: true, name: true, avatar: true, role: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(users)
  } catch (err) {
    console.error('[CHAT_USERS]', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
