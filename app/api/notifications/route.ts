export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, notificationEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    return NextResponse.json(notifications ?? [])
  } catch (err) {
    console.error('[NOTIFICATIONS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, title, message, type } = await req.json()

    const notification = await prisma.notification.create({
      data: { userId, title, message, type: type || 'course' },
    })

    // Send email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (user) {
      await sendEmail({
        to: user.email,
        subject: title,
        html: notificationEmail(title, message, user.name),
      })
    }

    return NextResponse.json(notification, { status: 201 })
  } catch (err) {
    console.error('[NOTIFICATIONS_POST]', err)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))

    if (body?.id) {
      await prisma.notification.update({
        where: { id: body.id },
        data: { read: true },
      })
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[NOTIFICATIONS_PATCH]', err)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
