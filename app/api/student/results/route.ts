import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [examAttempts, catAttempts, assignmentSubmissions] = await Promise.all([
      prisma.examAttempt.findMany({
        where: { studentId: session.user.id },
        include: {
          exam: {
            select: {
              title: true,
              totalMarks: true,
              passMark: true,
              duration: true,
              course: { select: { title: true } },
            },
          },
        },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.cATAttempt.findMany({
        where: { studentId: session.user.id, submittedAt: { not: null } },
        include: {
          cat: {
            select: {
              title: true,
              totalMarks: true,
              passMark: true,
              duration: true,
              module: {
                select: {
                  title: true,
                  course: { select: { title: true } },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.assignmentSubmission.findMany({
        where: { studentId: session.user.id },
        include: {
          assignment: {
            select: {
              title: true,
              totalMarks: true,
              type: true,
              course: { select: { title: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
    ])

    return NextResponse.json({ examAttempts, catAttempts, assignmentSubmissions })
  } catch (err) {
    console.error('[STUDENT_RESULTS]', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
