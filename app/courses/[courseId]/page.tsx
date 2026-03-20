export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import CourseDetail from '@/components/courses/CourseDetail'

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions)

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { resources: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  })

  if (!course) notFound()

  let isEnrolled = false
  let progress: any[] = []

  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: params.courseId } },
    })
    isEnrolled = !!enrollment

    if (isEnrolled) {
      progress = await prisma.progress.findMany({
        where: { userId: session.user.id },
        select: { lessonId: true, completed: true },
      })
    }
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedLessons = progress.filter(p => p.completed).length

  return (
    <CourseDetail
      course={course as any}
      isEnrolled={isEnrolled}
      progress={progress}
      totalLessons={totalLessons}
      completedLessons={completedLessons}
      isLoggedIn={!!session}
    />
  )
}
