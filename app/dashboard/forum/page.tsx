'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Plus, User, Clock, Loader2, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [activePost, setActivePost] = useState<any>(null)
  const [replyContent, setReplyContent] = useState('')
 const fetchPosts = async () => {
    const res = await fetch('/api/forum')
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    fetchPosts().finally(() => setLoading(false))
  }, [])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content) { toast.error('Title and content are required'); return }
    setSubmitting(true)
    const res = await fetch('/api/forum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
                    if (res.ok) {
                          toast.success('Reply posted!')
                          setReplyContent('')
                          await fetchPosts()
                          // Update activePost with fresh data
                          const updated = await fetch('/api/forum')
                          const data = await updated.json()
                          const fresh = Array.isArray(data) ? data : []
                          setPosts(fresh)
                          const refreshed = fresh.find((p: any) => p.id === post.id)
                          if (refreshed) setActivePost(refreshed)
                        } else {
      toast.error(json.error || 'Failed to create post')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-emerald-400" /> Community Forum
          </h1>
          <p className="text-slate-400 mt-1">Connect with peers, ask questions, share insights</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {showForm && (
        <div className="card border-primary-500/20 animate-slide-up">
          <h2 className="section-title text-lg mb-4">Create Discussion</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="What's your question or topic?"
                className="input"
              />
            </div>
            <div>
              <label className="label">Content</label>
              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Share more details, context, or thoughts..."
                className="input resize-none h-28"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Post
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
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No discussions yet. Start the first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white hover:text-primary-300 cursor-pointer transition-colors" onClick={() => setActivePost(activePost?.id === post.id ? null : post)}>
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.user?.name ?? 'Unknown'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(post.createdAt)}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{post.replies?.length ?? 0} replies</span>
                  </div>
                </div>
                <button onClick={() => setActivePost(activePost?.id === post.id ? null : post)} className="btn-ghost p-2 flex-shrink-0">
                  <ArrowRight className={`w-4 h-4 transition-transform ${activePost?.id === post.id ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {activePost?.id === post.id && (
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-3 animate-slide-up">
                  {post.replies?.length > 0 ? post.replies.map((reply: any) => (
                    <div key={reply.id} className="bg-slate-800/60 rounded-xl p-3">
                      <p className="text-xs text-primary-400 font-medium mb-1">{reply.user?.name}</p>
                      <p className="text-sm text-slate-300">{reply.content}</p>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-sm">No replies yet. Be the first!</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="input text-sm"
                    />
                    <button
                      onClick={async () => {
                        if (!replyContent.trim()) return
                        const res = await fetch(`/api/forum/${post.id}/replies`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ content: replyContent }),
                        })
                        if (res.ok) {
                          toast.success('Reply posted!')
                          setReplyContent('')
                        }
                      }}
                      className="btn-primary text-sm px-4 flex-shrink-0"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
