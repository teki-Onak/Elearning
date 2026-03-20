export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!dbUser || dbUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const surveyId = searchParams.get('surveyId')
    if (!surveyId) return NextResponse.json({ error: 'surveyId required' }, { status: 400 })

    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: { orderBy: { order: 'asc' } } },
    })
    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId },
      include: { user: { select: { name: true, email: true } } },
    })
    return NextResponse.json({ survey, responses })
  } catch (err) {
    console.error('[ADMIN_SURVEY_RESULTS]', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
