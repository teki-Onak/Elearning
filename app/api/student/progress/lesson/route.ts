export const dynamic = 'force-dynamic'
import { checkAndAwardAchievements } from '@/lib/achievements'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lessonId } = await req.json()
    if (!lessonId) return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 })

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId: session.user.id, lessonId, completed: true, completedAt: new Date() },
    })
    await checkAndAwardAchievements(session.user.id)
    return NextResponse.json(progress)

  } catch (err) {
    console.error('[LESSON_PROGRESS]', err)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lessonId } = await req.json()

    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: { completed: false, completedAt: null },
      create: { userId: session.user.id, lessonId, completed: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
