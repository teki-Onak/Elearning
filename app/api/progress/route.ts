import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mark lesson as complete
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lessonId, timeSpent } = await req.json()

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: {
        completed: true,
        timeSpent: { increment: timeSpent ?? 0 },
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId,
        completed: true,
        timeSpent: timeSpent ?? 0,
        completedAt: new Date(),
      },
    })

    return NextResponse.json(progress)
  } catch (err) {
    console.error('[PROGRESS_POST]', err)
    return NextResponse.json({ error: 'Failed to update progress.' }, { status: 500 })
  }
}

// Get user's progress for a course
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    // Get all lessons in this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
      },
    })

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))

    const progress = await prisma.progress.findMany({
      where: { userId: session.user.id, lessonId: { in: lessonIds } },
    })

    const completed = progress.filter((p) => p.completed).length
    const total = lessonIds.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return NextResponse.json({ progress, completed, total, percentage })
  } catch (err) {
    console.error('[PROGRESS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch progress.' }, { status: 500 })
  }
}
