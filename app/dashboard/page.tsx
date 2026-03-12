import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role === 'ADMIN') {
    return <AdminDashboard />
  }

  // Fetch student data
  const [enrollments, notifications, wellbeingLogs, achievements] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            modules: { include: { lessons: { select: { id: true } } } },
          },
        },
      },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id, read: false },
      take: 5,
    }),
    prisma.wellbeingLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      take: 4,
    }),
  ])

  // Calculate progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (e) => {
      const lessonIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
      const completed = await prisma.progress.count({
        where: { userId: session.user.id, lessonId: { in: lessonIds }, completed: true },
      })
      return { ...e, progress: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0 }
    })
  )

  return (
    <StudentDashboard
      user={session.user}
      enrollments={enrollmentsWithProgress}
      notifications={notifications}
      wellbeingLogs={wellbeingLogs}
      achievements={achievements}
    />
  )
}
