export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check and award any new achievements first
    await checkAndAwardAchievements(session.user.id)

    const [allAchievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { points: 'desc' } }),
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: { achievement: true },
      }),
    ])

    const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0)

    return NextResponse.json({ allAchievements, userAchievements, totalPoints })
  } catch (err) {
    console.error('[ACHIEVEMENTS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}
