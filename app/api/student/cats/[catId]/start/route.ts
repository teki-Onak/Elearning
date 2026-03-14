import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await prisma.cATAttempt.findUnique({
      where: { catId_studentId: { catId: params.catId, studentId: session.user.id } },
    })

    if (existing?.submittedAt) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    }

    const attempt = existing ?? await prisma.cATAttempt.create({
      data: { catId: params.catId, studentId: session.user.id, answers: {} },
    })

    const questions = await prisma.cATQuestion.findMany({
      where: { catId: params.catId },
      orderBy: { order: 'asc' },
      select: { id: true, text: true, type: true, options: true, marks: true, order: true },
    })

    return NextResponse.json({ attempt, questions })
  } catch (err) {
    console.error('[CAT_START]', err)
    return NextResponse.json({ error: 'Failed to start CAT' }, { status: 500 })
  }
}
