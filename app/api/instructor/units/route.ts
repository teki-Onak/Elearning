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
    if (!dbUser || !['INSTRUCTOR', 'HOD'].includes(dbUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unitAssignments = await prisma.unitInstructor.findMany({
      where: { instructorId: session.user.id },
      include: {
        module: {
          include: {
            course: { select: { id: true, title: true } },
            _count: { select: { lessons: true, assignments: true, cats: true } },
          },
        },
      },
    })

    const units = unitAssignments.map(ua => ua.module)
    return NextResponse.json(units ?? [])
  } catch (err) {
    console.error('[INSTRUCTOR_UNITS]', err)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}
