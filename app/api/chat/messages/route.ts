export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

// Get messages for a room
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')
    if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 })

    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    return NextResponse.json(messages)
  } catch (err) {
    console.error('[MESSAGES_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// Send a message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { roomId, content } = await req.json()
    if (!roomId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        userId: session.user.id,
        content,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Trigger Pusher event with minimal data (avoid 10KB limit)
    await pusherServer.trigger(`chat-${roomId}`, 'new-message', {
      id: message.id,
      roomId: message.roomId,
      content: message.content,
      createdAt: message.createdAt,
      user: {
        id: message.user.id,
        name: message.user.name,
        avatar: null, // Don't send avatar through Pusher - too large
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    console.error('[MESSAGES_POST]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
