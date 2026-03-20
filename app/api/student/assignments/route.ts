export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    })

    const courseIds = enrollments.map(e => e.courseId)

    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { select: { id: true, title: true } },
        submissions: {
          where: { studentId: session.user.id },
          select: { id: true, grade: true, submittedAt: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json(assignments ?? [])
  } catch (err) {
    console.error('[STUDENT_ASSIGNMENTS]', err)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { assignmentId, content } = await req.json()
    if (!assignmentId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: session.user.id } },
      update: { content, submittedAt: new Date() },
      create: { assignmentId, studentId: session.user.id, content },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (err) {
    console.error('[STUDENT_SUBMIT]', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
