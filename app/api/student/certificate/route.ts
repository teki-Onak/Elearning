import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    })
    if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: { select: { id: true } },
            cats: {
              include: {
                attempts: {
                  where: { studentId: session.user.id, submittedAt: { not: null } },
                  select: { passed: true },
                },
              },
            },
          },
        },
        hods: {
          include: { hod: { select: { name: true } } },
        },
      },
    })

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    // Calculate completion
    const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id))
    const completedLessons = allLessonIds.length > 0
      ? await prisma.progress.count({
          where: { userId: session.user.id, lessonId: { in: allLessonIds }, completed: true },
        })
      : 0

    const allCats = course.modules.flatMap(m => m.cats)
    const passedCats = allCats.filter(c => c.attempts.some(a => a.passed)).length

    const notesProgress = allLessonIds.length > 0
      ? Math.round((completedLessons / allLessonIds.length) * 100)
      : 100

    const catsProgress = allCats.length > 0
      ? Math.round((passedCats / allCats.length) * 100)
      : 100

    const overallProgress = Math.round((notesProgress + catsProgress) / 2)
    const isEligible = overallProgress >= 80

    return NextResponse.json({
      course: { id: course.id, title: course.title },
      student: { name: session.user.name, email: session.user.email },
      hod: course.hods?.[0]?.hod?.name ?? 'EduFlow',
      overallProgress,
      isEligible,
      completedLessons,
      totalLessons: allLessonIds.length,
      passedCats,
      totalCats: allCats.length,
      completedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[CERTIFICATE]', err)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}
