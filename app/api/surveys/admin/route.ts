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

    const surveys = await prisma.survey.findMany({
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(surveys)
  } catch (err) {
    console.error('[ADMIN_SURVEYS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!dbUser || dbUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, description, questions } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        questions: {
          create: questions?.map((q: any, i: number) => ({
            text: q.text,
            type: q.type,
            options: q.options || [],
            order: i,
            category: q.category || null,
          })) || [],
        },
      },
      include: { questions: true, _count: { select: { responses: true } } },
    })
    return NextResponse.json(survey, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_SURVEYS_POST]', err)
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 })
  }
}
