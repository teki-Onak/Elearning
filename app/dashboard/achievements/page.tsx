export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { Award, Lock, Loader2 } from 'lucide-react'

export default function AchievementsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/student/achievements')
      const d = await res.json()
      setData(d)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  const { allAchievements = [], userAchievements = [], totalPoints = 0 } = data ?? {}
  const earnedIds = new Set(userAchievements.map((ua: any) => ua.achievementId))

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
          <h2 className="text-white font-semibold text-lg mb-4">Earned Achievements</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {userAchievements.map((ua: any) => (
              <div key={ua.id} className="card border border-amber-500/20 bg-amber-900/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {ua.achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{ua.achievement.name}</p>
                  <p className="text-slate-400 text-sm">{ua.achievement.description}</p>
                  <p className="text-amber-400 text-xs mt-1">+{ua.achievement.points} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Achievements */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4">All Achievements</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {allAchievements.map((a: any) => {
            const earned = earnedIds.has(a.id)
            return (
              <div key={a.id} className={'card flex items-center gap-4 ' + (earned ? 'border-amber-500/20' : 'opacity-50')}>
                <div className={'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ' + (earned ? 'bg-amber-500/20' : 'bg-slate-800')}>
                  {earned ? a.icon : <Lock className="w-5 h-5 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={'font-semibold ' + (earned ? 'text-white' : 'text-slate-400')}>{a.name}</p>
                  <p className="text-slate-400 text-sm">{a.description}</p>
                  <p className={'text-xs mt-1 ' + (earned ? 'text-amber-400' : 'text-slate-500')}>
                    {earned ? '✓ Earned · ' : ''}{a.points} points
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
