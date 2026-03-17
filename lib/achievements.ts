import { prisma } from '@/lib/prisma'

export async function checkAndAwardAchievements(userId: string) {
  try {
    const [userAchievements, progressCount, enrollments, catAttempts, forumPosts, surveyResponses] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
      prisma.progress.count({
        where: { userId, completed: true },
      }),
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              modules: { include: { lessons: { select: { id: true } } } },
            },
          },
        },
      }),
      prisma.cATAttempt.count({
        where: { studentId: userId, passed: true, submittedAt: { not: null } },
      }),
      prisma.forumPost.count({ where: { userId } }),
      prisma.surveyResponse.count({ where: { userId } }),
    ])

    const earnedIds = new Set(userAchievements.map(ua => ua.achievementId))
    const allAchievements = await prisma.achievement.findMany()

    // Calculate completed courses
    const completedCourses = await Promise.all(
      enrollments.map(async e => {
        const lessonIds = e.course.modules.flatMap(m => m.lessons.map(l => l.id))
        if (lessonIds.length === 0) return false
        const completed = await prisma.progress.count({
          where: { userId, lessonId: { in: lessonIds }, completed: true },
        })
        return completed === lessonIds.length
      })
    )
    const completedCourseCount = completedCourses.filter(Boolean).length

    // Check wellbeing streak
    const wellbeingLogs = await prisma.wellbeingLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 7,
      select: { createdAt: true },
    })
    let wellbeingStreak = 0
    if (wellbeingLogs.length >= 7) {
      const today = new Date()
      wellbeingStreak = 7
      for (let i = 0; i < 7; i++) {
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)
        const log = wellbeingLogs[i]
        if (!log) { wellbeingStreak = 0; break }
        const logDate = new Date(log.createdAt)
        if (logDate.toDateString() !== expectedDate.toDateString()) {
          wellbeingStreak = 0; break
        }
      }
    }

    const conditionMap: Record<string, boolean> = {
      complete_1_lesson: progressCount >= 1,
      complete_5_lessons: progressCount >= 5,
      complete_1_course: completedCourseCount >= 1,
      complete_3_courses: completedCourseCount >= 3,
      wellbeing_7_days: wellbeingStreak >= 7,
      pass_10_quizzes: catAttempts >= 10,
      forum_first_post: forumPosts >= 1,
      complete_survey: surveyResponses >= 1,
    }

    const toAward = allAchievements.filter(a =>
      !earnedIds.has(a.id) && conditionMap[a.condition] === true
    )

    if (toAward.length > 0) {
      await prisma.userAchievement.createMany({
        data: toAward.map(a => ({ userId, achievementId: a.id })),
        skipDuplicates: true,
      })

      await prisma.notification.createMany({
        data: toAward.map(a => ({
          userId,
          title: `Achievement Unlocked: ${a.name} ${a.icon}`,
          message: `${a.description} — You earned ${a.points} points!`,
          type: 'achievement',
        })),
      })
    }

    return toAward
  } catch (err) {
    console.error('[ACHIEVEMENTS]', err)
    return []
  }
}
