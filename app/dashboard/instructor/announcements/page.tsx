'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Megaphone, Send, Loader2, Users, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InstructorAnnouncementsPage() {
  const [units, setUnits] = useState<any[]>([])
  const [selectedUnit, setSelectedUnit] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/instructor/announcements')
      .then(r => r.json())
      .then(data => {
        setUnits(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const handleSend = async () => {
    if (!selectedUnit) { toast.error('Please select a unit'); return }
    if (!title) { toast.error('Title is required'); return }
    if (!message) { toast.error('Message is required'); return }

    setSending(true)
    const res = await fetch('/api/instructor/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, unitId: selectedUnit }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success(`Announcement sent to ${json.sent} students!`)
      setSentCount(json.sent)
      setTitle('')
      setMessage('')
      setSelectedUnit('')
    } else {
      toast.error(json.error || 'Failed to send')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-amber-400" /> Send Announcement
        </h1>
        <p className="text-slate-400 mt-1">Send notifications to students in your assigned units</p>
      </div>

      <div className="card space-y-6">
        {/* Unit Selection */}
        <div>
          <label className="label">Select Unit</label>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading units...
            </div>
          ) : units.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-4 text-slate-400 text-sm">
              You are not assigned to any units yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {units.map(unit => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedUnit === unit.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 ${selectedUnit === unit.id ? 'text-primary-400' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${selectedUnit === unit.id ? 'text-white' : 'text-slate-300'}`}>
                      {unit.title}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-6">{unit.courseName}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="label">Announcement Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Assignment Due Tomorrow"
            className="input w-full"
          />
        </div>

        {/* Message */}
        <div>
          <label className="label">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message to students..."
            className="input w-full resize-none h-32"
          />
          <p className="text-xs text-slate-500 mt-1">{message.length} characters</p>
        </div>

        {/* Preview */}
        {(title || message) && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-2">Preview</p>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📢</span>
              <div>
                <p className="text-white font-medium">{title || 'Title...'}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {selectedUnit ? `[${units.find(u => u.id === selectedUnit)?.title}] ` : ''}{message || 'Message...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || !selectedUnit}
          className="btn-primary flex items-center gap-2 w-full justify-center"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending...' : 'Send Announcement'}
        </button>

        {/* Success */}
        {sentCount !== null && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Successfully sent to {sentCount} students!
          </div>
        )}
      </div>
    </div>
  )
}
