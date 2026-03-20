export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

// Get all chat rooms for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: { some: { userId: session.user.id } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(rooms)
  } catch (err) {
    console.error('[CHAT_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}

// Create a new chat room or get existing
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, type, courseId, name } = await req.json()

    if (type === 'direct') {
      // Check if direct room already exists
      const existing = await prisma.chatRoom.findFirst({
        where: {
          type: 'direct',
          AND: [
            { members: { some: { userId: session.user.id } } },
            { members: { some: { userId } } },
          ],
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatar: true, role: true } },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { user: { select: { name: true } } },
          },
        },
      })
      if (existing) return NextResponse.json(existing)

      // Create new direct room
      const room = await prisma.chatRoom.create({
        data: {
          type: 'direct',
          members: {
            create: [
              { userId: session.user.id },
              { userId },
            ],
          },
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatar: true, role: true } },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { user: { select: { name: true } } },
          },
        },
      })
      return NextResponse.json(room, { status: 201 })
    }

    // Group chat
    const room = await prisma.chatRoom.create({
      data: {
        type: 'group',
        name,
        courseId,
        members: {
          create: [{ userId: session.user.id }],
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { user: { select: { name: true } } },
        },
      },
    })
    return NextResponse.json(room, { status: 201 })
  } catch (err) {
    console.error('[CHAT_POST]', err)
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
  }
}
