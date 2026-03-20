export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!dbUser || dbUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, message, targetRole } = await req.json()
    if (!title || !message) return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })

    // Get target users
    const users = await prisma.user.findMany({
      where: targetRole === 'ALL' ? {} : { role: targetRole },
      select: { id: true },
    })

    // Create notifications for all users
    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        title,
        message,
        type: 'announcement',
      })),
    })

    return NextResponse.json({ success: true, sent: users.length })
  } catch (err) {
    console.error('[ANNOUNCEMENT]', err)
    return NextResponse.json({ error: 'Failed to send announcement' }, { status: 500 })
  }
}
