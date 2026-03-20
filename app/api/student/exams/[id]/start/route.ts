export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    })

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    if (!exam.isPublished) return NextResponse.json({ error: 'Exam not available' }, { status: 403 })

    const existing = await prisma.examAttempt.findUnique({
      where: { examId_studentId: { examId: params.id, studentId: session.user.id } },
    })
    if (existing?.submittedAt) {
      return NextResponse.json({ error: 'Already attempted' }, { status: 409 })
    }

    await prisma.examAttempt.upsert({
      where: { examId_studentId: { examId: params.id, studentId: session.user.id } },
      update: { startedAt: new Date() },
      create: { examId: params.id, studentId: session.user.id, answers: {} },
    })

    const questions = exam.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      marks: q.marks,
      order: q.order,
      type: q.type,
    }))

    return NextResponse.json({ questions })
  } catch (err) {
    console.error('[EXAM_START]', err)
    return NextResponse.json({ error: 'Failed to start exam' }, { status: 500 })
  }
}
