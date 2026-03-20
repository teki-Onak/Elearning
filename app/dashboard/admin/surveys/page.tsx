'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { ClipboardList, Plus, Loader2, Users, BarChart2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newSurvey, setNewSurvey] = useState({ title: '', description: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/surveys').then(r => r.json()).then(data => {
      setSurveys(data)
      setLoading(false)
    })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSurvey.title) { toast.error('Title is required'); return }

    setCreating(true)
    const res = await fetch('/api/surveys/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSurvey),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success('Survey created!')
      setSurveys(prev => [json, ...prev])
      setNewSurvey({ title: '', description: '' })
      setShowForm(false)
    } else {
      toast.error(json.error)
    }
    setCreating(false)
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-amber-400" /> Survey Management
          </h1>
          <p className="text-slate-400 mt-1">Create and manage research surveys for students</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Survey
        </button>
      </div>

      {showForm && (
        <div className="card border-primary-500/20 animate-slide-up">
          <h2 className="section-title text-lg mb-4">Create Survey</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Survey Title</label>
              <input
                type="text"
                value={newSurvey.title}
                onChange={e => setNewSurvey(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Online Learning Experience Survey"
                className="input"
              />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea
                value={newSurvey.description}
                onChange={e => setNewSurvey(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description for students..."
                className="input resize-none h-20"
              />
            </div>
            <p className="text-xs text-slate-400">
              After creating the survey, add questions directly in the database or use the Prisma Studio tool.
            </p>
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Survey
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No surveys yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{survey.title}</h3>
                    <span className={`badge ${survey.isActive ? 'badge-success' : 'badge-error'}`}>
                      {survey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {survey.description && <p className="text-slate-400 text-sm">{survey.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />{survey.questions?.length ?? 0} questions</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{survey._count?.responses ?? 0} responses</span>
                    <span>Created {formatDate(survey.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="btn-secondary text-xs flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5" /> View Results
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
