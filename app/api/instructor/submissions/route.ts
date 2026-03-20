export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || dbUser.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment: { instructorId: session.user.id },
      },
      include: {
        assignment: { select: { id: true, title: true, totalMarks: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json(submissions ?? [])
  } catch (err) {
    console.error('[SUBMISSIONS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (!dbUser || dbUser.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId, grade, feedback } = await req.json()
    if (!submissionId || grade === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { grade: Number(grade), feedback },
      include: {
        assignment: { select: { title: true, totalMarks: true } },
        student: { select: { id: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: submission.student.id,
        title: `Assignment Graded 📝`,
        message: `Your submission for "${submission.assignment.title}" has been graded. Score: ${grade}/${submission.assignment.totalMarks}`,
        type: 'course',
      },
    })

    return NextResponse.json(submission)
  } catch (err) {
    console.error('[SUBMISSIONS_PATCH]', err)
    return NextResponse.json({ error: 'Failed to grade submission' }, { status: 500 })
  }
}
