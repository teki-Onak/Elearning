import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Award, Lock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { points: 'desc' } }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
    }),
  ])

  const earnedIds = new Set(userAchievements.map(ua => ua.achievementId))
  const totalPoints = userAchievements.reduce((a, ua) => a + ua.achievement.points, 0)

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-amber-400" /> Achievements
        </h1>
        <p className="text-slate-400 mt-1">
          {userAchievements.length} earned · {totalPoints} points total
        </p>
      </div>

      {/* Points card */}
      <div className="card bg-gradient-to-br from-amber-900/30 to-amber-800/10 border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Points Earned</p>
            <p className="font-display text-4xl font-bold text-amber-300">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Earned */}
      {userAchievements.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Earned Achievements</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {userAchievements.map((ua) => (
              <div key={ua.id} className="card flex items-center gap-4 border-amber-500/20 bg-amber-900/10">
                <div className="text-3xl">{ua.achievement.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{ua.achievement.name}</p>
                  <p className="text-sm text-slate-400">{ua.achievement.description}</p>
                  <p className="text-xs text-slate-500 mt-1">Earned {formatDate(ua.earnedAt)}</p>
                </div>
                <span className="badge-warning">{ua.achievement.points}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="section-title mb-4">All Achievements</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {allAchievements.filter(a => !earnedIds.has(a.id)).map((a) => (
            <div key={a.id} className="card flex items-center gap-4 opacity-50">
              <div className="text-3xl grayscale">{a.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-white">{a.name}</p>
                <p className="text-sm text-slate-400">{a.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Lock className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">{a.points}pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
