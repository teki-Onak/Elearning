'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Heart, TrendingUp, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatDate, getMoodLabel, getMoodColor } from '@/lib/utils'

const SCALE = [
  { value: 1, label: 'Very Low', emoji: '😔' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Excellent', emoji: '😄' },
]

export default function WellbeingPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mood, setMood] = useState(3)
  const [stress, setStress] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [note, setNote] = useState('')

  useEffect(() => {
    fetch('/api/wellbeing?days=30')
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/wellbeing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, stress, energy, note }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error)
    } else {
      toast.success('Wellbeing logged! Keep it up 💚')
      setLogs(prev => [json, ...prev])
      setNote('')
    }
    setSubmitting(false)
  }

  const chartData = [...logs].reverse().map(l => ({
    date: new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: l.mood,
    energy: l.energy,
    stress: l.stress,
  }))

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <Heart className="w-7 h-7 text-pink-400" /> Wellbeing Tracker
        </h1>
        <p className="text-slate-400 mt-1">
          Track your daily mood, stress, and energy to understand how online learning affects your mental health.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Log Form */}
        <div className="card">
          <h2 className="section-title text-xl mb-6">How are you feeling today?</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { label: 'Mood', value: mood, setter: setMood, emoji: '💭' },
              { label: 'Energy Level', value: energy, setter: setEnergy, emoji: '⚡' },
              { label: 'Stress Level', value: stress, setter: setStress, emoji: '🌡️' },
            ].map((field) => (
              <div key={field.label}>
                <label className="label">{field.emoji} {field.label}</label>
                <div className="flex gap-2">
                  {SCALE.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => field.setter(s.value)}
                      className={`flex-1 py-3 rounded-xl border text-lg transition-all duration-150 ${
                        field.value === s.value
                          ? 'border-primary-500 bg-primary-500/15 scale-105'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                      title={s.label}
                    >
                      {s.emoji}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                  <span>Very Low</span>
                  <span className="font-medium text-slate-300">{getMoodLabel(field.value)}</span>
                  <span>Excellent</span>
                </div>
              </div>
            ))}

            <div>
              <label className="label">📝 Notes (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="How was your learning session today? Any challenges?"
                className="input resize-none h-20"
                maxLength={500}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : '💚 Log Today\'s Wellbeing'}
            </button>
          </form>
        </div>

        {/* Recent Logs */}
        <div className="card">
          <h2 className="section-title text-xl mb-5">Recent Entries</h2>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10">
              <Heart className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No entries yet. Log your first wellbeing check-in!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-800/60 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-slate-400">{formatDate(log.createdAt)}</p>
                    <span className={`text-sm font-medium ${getMoodColor(log.mood)}`}>
                      {getMoodLabel(log.mood)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-700/40 rounded-lg py-1.5">
                      <div className="text-slate-400 mb-0.5">Mood</div>
                      <div className={`font-semibold ${getMoodColor(log.mood)}`}>{log.mood}/5</div>
                    </div>
                    <div className="bg-slate-700/40 rounded-lg py-1.5">
                      <div className="text-slate-400 mb-0.5">Energy</div>
                      <div className={`font-semibold ${getMoodColor(log.energy)}`}>{log.energy}/5</div>
                    </div>
                    <div className="bg-slate-700/40 rounded-lg py-1.5">
                      <div className="text-slate-400 mb-0.5">Stress</div>
                      <div className={`font-semibold ${getMoodColor(6 - log.stress)}`}>{log.stress}/5</div>
                    </div>
                  </div>
                  {log.note && <p className="text-xs text-slate-400 mt-2 italic">"{log.note}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <h2 className="section-title text-xl mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> 30-Day Wellbeing Trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 5]} stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#22c55e" strokeWidth={2} dot={false} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={false} name="Energy" />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={false} name="Stress" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
