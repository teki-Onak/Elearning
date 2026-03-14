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
    if (!dbUser || !['HOD', 'ADMIN'].includes(dbUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get courses this HoD manages
    const hodCourses = await prisma.courseHoD.findMany({
      where: { hodId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                unitInstructors: {
                  include: { instructor: { select: { id: true, name: true, email: true } } },
                },
                _count: { select: { lessons: true, assignments: true, cats: true } },
              },
            },
            _count: { select: { enrollments: true } },
          },
        },
      },
    })

    const courses = hodCourses.map(hc => hc.course)

    // Stats
    const totalStudents = courses.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0)
    const totalUnits = courses.reduce((sum, c) => sum + c.modules.length, 0)
    const totalInstructors = new Set(
      courses.flatMap(c => c.modules.flatMap(m => m.unitInstructors.map(ui => ui.instructor.id)))
    ).size

    return NextResponse.json({
      courses,
      stats: {
        totalCourses: courses.length,
        totalStudents,
        totalUnits,
        totalInstructors,
      },
    })
  } catch (err) {
    console.error('[HOD_OVERVIEW]', err)
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 })
  }
}
