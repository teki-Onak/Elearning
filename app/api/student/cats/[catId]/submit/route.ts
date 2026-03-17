import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function POST(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { answers } = await req.json()

    const questions = await prisma.cATQuestion.findMany({
      where: { catId: params.catId },
    })

    const cat = await prisma.cAT.findUnique({ where: { id: params.catId } })
    if (!cat) return NextResponse.json({ error: 'CAT not found' }, { status: 404 })

    // Auto grade
    let score = 0
    questions.forEach(q => {
      const studentAnswer = answers[q.id]
      if (q.type === 'SHORT_ANSWER') {
        if (studentAnswer?.toLowerCase().trim() === q.answer.toLowerCase().trim()) score += q.marks
      } else {
        if (studentAnswer === q.answer) score += q.marks
      }
    })

    const percentage = cat.totalMarks > 0 ? (score / cat.totalMarks) * 100 : 0
    const passed = percentage >= cat.passMark

    const attempt = await prisma.cATAttempt.update({
      where: { catId_studentId: { catId: params.catId, studentId: session.user.id } },
      data: { answers, score, passed, submittedAt: new Date() },
    })

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: `CAT Result: ${cat.title}`,
        message: `You scored ${score}/${cat.totalMarks} (${Math.round(percentage)}%). ${passed ? 'You passed! 🎉' : 'You did not pass. Keep studying!'}`,
        type: 'course',
      },
    })

    await checkAndAwardAchievements(session.user.id)
    return NextResponse.json({ attempt, score, passed, percentage: Math.round(percentage) })
  } catch (err) {
    console.error('[CAT_SUBMIT]', err)
    return NextResponse.json({ error: 'Failed to submit CAT' }, { status: 500 })
  }
}
