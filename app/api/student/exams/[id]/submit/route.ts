import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { answers } = await req.json()

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: { questions: true },
    })

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    // Calculate score
    let correct = 0
    let totalMarks = 0

    exam.questions.forEach(q => {
      totalMarks += q.marks
      if (answers[q.id] === q.answer) {
        correct += q.marks
      }
    })

    const score = totalMarks > 0 ? Math.round((correct / totalMarks) * 100) : 0
    const passed = score >= exam.passMark

    // Save attempt
    await prisma.examAttempt.upsert({
      where: { examId_studentId: { examId: params.id, studentId: session.user.id } },
      update: { answers, score, passed, submittedAt: new Date() },
      create: { examId: params.id, studentId: session.user.id, answers, score, passed, submittedAt: new Date() },
    })

    // Send notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: passed ? `Exam Passed! 🎉` : `Exam Completed`,
        message: `You scored ${score}% on "${exam.title}". ${passed ? 'Congratulations!' : `Pass mark was ${exam.passMark}%.`}`,
        type: 'course',
      },
    })

    return NextResponse.json({ score, correct, passed, total: exam.questions.length })
  } catch (err) {
    console.error('[EXAM_SUBMIT]', err)
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 })
  }
}
