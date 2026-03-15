import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
    }

    const [
      totalUsers,
      totalStudents,
      totalEnrollments,
      totalSurveyResponses,
      totalCourses,
      totalInstructors,
      recentUsers,
      topCourses,
      wellbeingAvg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.enrollment.count(),
      prisma.surveyResponse.count(),
      prisma.course.count(),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.course.findMany({
        take: 5,
        where: { isPublished: true },
        orderBy: { enrollments: { _count: 'desc' } },
        select: {
          id: true,
          title: true,
          category: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.wellbeingLog.aggregate({
        _avg: { mood: true, stress: true, energy: true },
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    const enrollmentTrend = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        date.setHours(0, 0, 0, 0)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        const count = await prisma.enrollment.count({
          where: { enrolledAt: { gte: date, lt: nextDate } },
        })
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          enrollments: count,
        }
      })
    )

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalEnrollments,
        totalSurveyResponses,
        totalCourses,
        totalInstructors,
      },
      recentUsers,
      topCourses,
      enrollmentTrend,
      wellbeingAvg: wellbeingAvg._avg,
    })
  } catch (err) {
    console.error('[ADMIN_STATS]', err)
    return NextResponse.json({ error: 'Failed to fetch admin stats.' }, { status: 500 })
  }
}
