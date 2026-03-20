export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const surveys = await prisma.survey.findMany({
      where: { isActive: true },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } },
      },
    })

    // Check which surveys this user has already completed
    const completed = await prisma.surveyResponse.findMany({
      where: { userId: session.user.id },
      select: { surveyId: true },
    })
    const completedIds = new Set(completed.map((r) => r.surveyId))

    const surveysWithStatus = surveys.map((s) => ({
      ...s,
      isCompleted: completedIds.has(s.id),
    }))

    return NextResponse.json(surveysWithStatus)
  } catch (err) {
    console.error('[SURVEYS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch surveys.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { surveyId, answers } = await req.json()

    const existing = await prisma.surveyResponse.findUnique({
      where: { userId_surveyId: { userId: session.user.id, surveyId } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already completed this survey.' }, { status: 409 })
    }

    const response = await prisma.surveyResponse.create({
      data: { userId: session.user.id, surveyId, answers },
    })
    await checkAndAwardAchievements(session.user.id)
    return NextResponse.json(response, { status: 201 })
  } catch (err) {
    console.error('[SURVEYS_POST]', err)
    return NextResponse.json({ error: 'Failed to submit survey.' }, { status: 500 })
  }
}
