'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Megaphone, Send, Loader2, Users, GraduationCap, BookOpen, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const TARGET_OPTIONS = [
  { value: 'ALL', label: 'Everyone', icon: Globe, desc: 'All users on the platform' },
  { value: 'STUDENT', label: 'Students Only', icon: GraduationCap, desc: 'All enrolled students' },
  { value: 'INSTRUCTOR', label: 'Instructors Only', icon: BookOpen, desc: 'All instructors' },
]

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState('ALL')
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)

  const handleSend = async () => {
    if (!title) { toast.error('Title is required'); return }
    if (!message) { toast.error('Message is required'); return }

    setSending(true)
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, targetRole }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success(`Announcement sent to ${json.sent} users!`)
      setSentCount(json.sent)
      setTitle('')
      setMessage('')
      setTargetRole('ALL')
    } else {
      toast.error(json.error || 'Failed to send')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-amber-400" /> Announcements
        </h1>
        <p className="text-slate-400 mt-1">Send notifications to all students, instructors or everyone</p>
      </div>

      <div className="card space-y-6">
        {/* Target Audience */}
        <div>
          <label className="label mb-3">Send To</label>
          <div className="grid grid-cols-3 gap-3">
            {TARGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTargetRole(opt.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  targetRole === opt.value
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <opt.icon className={`w-5 h-5 mb-2 ${targetRole === opt.value ? 'text-primary-400' : 'text-slate-400'}`} />
                <p className={`text-sm font-medium ${targetRole === opt.value ? 'text-white' : 'text-slate-300'}`}>{opt.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="label">Announcement Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., System Maintenance Notice"
            className="input w-full"
          />
        </div>

        {/* Message */}
        <div>
          <label className="label">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your announcement message here..."
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
                <p className="text-slate-400 text-sm mt-1">{message || 'Message...'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="btn-primary flex items-center gap-2 w-full justify-center"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending...' : `Send Announcement`}
        </button>

        {/* Success */}
        {sentCount !== null && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Successfully sent to {sentCount} users!
          </div>
        )}
      </div>
    </div>
  )
}
