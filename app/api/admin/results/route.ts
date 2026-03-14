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
    if (!dbUser || !['ADMIN', 'HOD'].includes(dbUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [examAttempts, catAttempts, assignmentSubmissions] = await Promise.all([
      prisma.examAttempt.findMany({
        include: {
          exam: { select: { title: true, totalMarks: true, course: { select: { title: true } } } },
          student: { select: { name: true, email: true } },
        },
        orderBy: { startedAt: 'desc' },
        take: 100,
      }),
      prisma.cATAttempt.findMany({
        where: { submittedAt: { not: null } },
        include: {
          cat: {
            select: {
              title: true,
              totalMarks: true,
              module: { select: { title: true, course: { select: { title: true } } } },
            },
          },
          student: { select: { name: true, email: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 100,
      }),
      prisma.assignmentSubmission.findMany({
        include: {
          assignment: { select: { title: true, totalMarks: true, course: { select: { title: true } } } },
          student: { select: { name: true, email: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 100,
      }),
    ])

    return NextResponse.json({ examAttempts, catAttempts, assignmentSubmissions })
  } catch (err) {
    console.error('[ADMIN_RESULTS]', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
