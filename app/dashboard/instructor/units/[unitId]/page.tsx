'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, X, Check, Loader2, BookMarked, ClipboardList, Video, Link, Clock, GraduationCap, Eye, EyeOff } from 'lucide-react'

type Tab = 'notes' | 'assignments' | 'cats' | 'online'

export default function InstructorUnitPage() {
  const { unitId } = useParams()
  const router = useRouter()
  const [unit, setUnit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [noteForm, setNoteForm] = useState({ title: '', content: '', videoUrl: '' })
  const [assignForm, setAssignForm] = useState({ title: '', description: '', type: 'ASSIGNMENT', dueDate: '', totalMarks: 100 })
  const [catForm, setCatForm] = useState({ title: '', description: '', duration: 30, totalMarks: 30, passMark: 50, startTime: '', endTime: '' })
  const [onlineForm, setOnlineForm] = useState({ onlineClassLink: '', onlineClassDate: '' })

  const fetchUnit = async () => {
    setLoading(true)
    const res = await fetch(`/api/instructor/units/${unitId}`)
    const data = await res.json()
    setUnit(data)
    if (data.onlineClassLink) setOnlineForm({ onlineClassLink: data.onlineClassLink, onlineClassDate: data.onlineClassDate?.slice(0, 16) || '' })
    setLoading(false)
  }

  useEffect(() => { fetchUnit() }, [unitId])

  const handleSaveNote = async () => {
    if (!noteForm.title || !noteForm.content) return setError('Title and content required')
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/instructor/units/${unitId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteForm),
      })
      if (!res.ok) throw new Error('Failed to save note')
      setShowModal(false)
      setNoteForm({ title: '', content: '', videoUrl: '' })
      fetchUnit()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (lessonId: string) => {
    await fetch(`/api/instructor/units/${unitId}/notes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId }),
    })
    fetchUnit()
  }

  const handleSaveAssignment = async () => {
    if (!assignForm.title || !assignForm.dueDate) return setError('Title and due date required')
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/instructor/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assignForm, courseId: unit.courseId, moduleId: unitId }),
      })
      if (!res.ok) throw new Error('Failed to save assignment')
      setShowModal(false)
      setAssignForm({ title: '', description: '', type: 'ASSIGNMENT', dueDate: '', totalMarks: 100 })
      fetchUnit()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCAT = async () => {
    if (!catForm.title || !catForm.startTime) return setError('Title and start time required')
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/instructor/units/${unitId}/cats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      })
      if (!res.ok) throw new Error('Failed to save CAT')
      setShowModal(false)
      setCatForm({ title: '', description: '', duration: 30, totalMarks: 30, passMark: 50, startTime: '', endTime: '' })
      fetchUnit()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOnlineClass = async () => {
    setSaving(true)
    try {
      await fetch(`/api/instructor/units/${unitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onlineClassLink: onlineForm.onlineClassLink,
          onlineClassDate: onlineForm.onlineClassDate ? new Date(onlineForm.onlineClassDate) : null,
        }),
      })
      fetchUnit()
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { key: 'notes', label: 'Notes', icon: BookMarked },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList },
    { key: 'cats', label: 'CATs', icon: GraduationCap },
    { key: 'online', label: 'Online Class', icon: Video },
  ]

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/dashboard/instructor/units')} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-white">{unit?.title}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{unit?.course?.title}</p>
        </div>
        {activeTab !== 'online' && (
          <button onClick={() => { setShowModal(true); setError('') }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {activeTab === 'notes' ? 'Add Note' : activeTab === 'assignments' ? 'Add Assignment' : 'Add CAT'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as Tab); setShowModal(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {unit?.lessons?.length === 0 ? (
            <div className="card text-center py-16">
              <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No notes yet. Add your first note!</p>
            </div>
          ) : (
            unit?.lessons?.map((lesson: any, i: number) => (
              <div key={lesson.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <h3 className="font-semibold text-white">{lesson.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm ml-8 line-clamp-3">{lesson.content}</p>
                    {lesson.videoUrl && (
                      <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-400 text-xs mt-2 ml-8 hover:underline">
                        <Video className="w-3.5 h-3.5" /> Video Link
                      </a>
                    )}
                  </div>
                  <button onClick={() => handleDeleteNote(lesson.id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors ml-4">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {unit?.assignments?.length === 0 ? (
            <div className="card text-center py-16">
              <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No assignments yet.</p>
            </div>
          ) : (
            unit?.assignments?.map((a: any) => (
              <div key={a.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{a.title}</h3>
                      <span className="badge text-xs badge-primary">{a.type}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{a.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                      <span>{a.totalMarks} marks</span>
                      <span>{a._count?.submissions ?? 0} submissions</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CATS TAB */}
      {activeTab === 'cats' && (
        <div className="space-y-4">
          {unit?.cats?.length === 0 ? (
            <div className="card text-center py-16">
              <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No CATs yet.</p>
            </div>
          ) : (
            unit?.cats?.map((cat: any) => (
              <div key={cat.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{cat.title}</h3>
                      <span className={`badge text-xs ${cat.isPublished ? 'badge-success' : 'bg-slate-700 text-slate-300'}`}>
                        {cat.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {cat.description && <p className="text-slate-400 text-sm mb-2">{cat.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cat.duration} mins</span>
                      <span>{cat.totalMarks} marks</span>
                      <span>Pass: {cat.passMark}%</span>
                      <span>{cat._count?.questions ?? 0} questions</span>
                      <span>{cat._count?.attempts ?? 0} attempts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ONLINE CLASS TAB */}
      {activeTab === 'online' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-primary-400" />
            <h2 className="text-white font-semibold">Online Class Link</h2>
          </div>
          {unit?.onlineClassLink && (
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
              <Link className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <div>
                <a href={unit.onlineClassLink} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline text-sm break-all">
                  {unit.onlineClassLink}
                </a>
                {unit.onlineClassDate && (
                  <p className="text-slate-400 text-xs mt-1">
                    Scheduled: {new Date(unit.onlineClassDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Class Link (Zoom, Google Meet, Teams...)</label>
            <input
              className="input w-full"
              placeholder="https://zoom.us/j/..."
              value={onlineForm.onlineClassLink}
              onChange={e => setOnlineForm({ ...onlineForm, onlineClassLink: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              className="input w-full"
              value={onlineForm.onlineClassDate}
              onChange={e => setOnlineForm({ ...onlineForm, onlineClassDate: e.target.value })}
            />
          </div>
          <button onClick={handleSaveOnlineClass} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Class Link
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="font-display text-lg font-bold text-white">
                {activeTab === 'notes' ? 'Add Note' : activeTab === 'assignments' ? 'Add Assignment' : 'Add CAT'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

              {/* Note Form */}
              {activeTab === 'notes' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Title *</label>
                    <input className="input w-full" placeholder="e.g. Introduction to Arrays" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Content *</label>
                    <textarea className="input w-full h-40 resize-none" placeholder="Write your notes here..." value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Video Link (optional)</label>
                    <input className="input w-full" placeholder="https://youtube.com/..." value={noteForm.videoUrl} onChange={e => setNoteForm({ ...noteForm, videoUrl: e.target.value })} />
                  </div>
                </>
              )}

              {/* Assignment Form */}
              {activeTab === 'assignments' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Title *</label>
                    <input className="input w-full" placeholder="Assignment title" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                    <textarea className="input w-full h-24 resize-none" placeholder="Assignment instructions..." value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Type</label>
                      <select className="input w-full" value={assignForm.type} onChange={e => setAssignForm({ ...assignForm, type: e.target.value })}>
                        <option value="ASSIGNMENT">Assignment</option>
                        <option value="PROJECT">Project</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Total Marks</label>
                      <input type="number" className="input w-full" value={assignForm.totalMarks} onChange={e => setAssignForm({ ...assignForm, totalMarks: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Due Date *</label>
                    <input type="datetime-local" className="input w-full" value={assignForm.dueDate} onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
                  </div>
                </>
              )}

              {/* CAT Form */}
              {activeTab === 'cats' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">CAT Title *</label>
                    <input className="input w-full" placeholder="e.g. Unit 1 CAT" value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                    <textarea className="input w-full h-20 resize-none" placeholder="Instructions for students..." value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Duration (mins)</label>
                      <input type="number" className="input w-full" value={catForm.duration} onChange={e => setCatForm({ ...catForm, duration: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Total Marks</label>
                      <input type="number" className="input w-full" value={catForm.totalMarks} onChange={e => setCatForm({ ...catForm, totalMarks: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Pass Mark %</label>
                      <input type="number" className="input w-full" value={catForm.passMark} onChange={e => setCatForm({ ...catForm, passMark: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">Start Time *</label>
                      <input type="datetime-local" className="input w-full" value={catForm.startTime} onChange={e => setCatForm({ ...catForm, startTime: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1.5">End Time</label>
                      <input type="datetime-local" className="input w-full" value={catForm.endTime} onChange={e => setCatForm({ ...catForm, endTime: e.target.value })} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={activeTab === 'notes' ? handleSaveNote : activeTab === 'assignments' ? handleSaveAssignment : handleSaveCAT}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
