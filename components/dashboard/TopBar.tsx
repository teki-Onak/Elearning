'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Search, Menu, CheckCheck, X } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface TopBarProps {
  user: { name: string; email: string; role: string; avatar?: string | null }
}

export default function TopBar({ user }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>({ courses: [], users: [], forums: [] })
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<any>(null)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (value.length < 2) { setShowResults(false); return }
    setShowResults(true)
    setSearching(true)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
      const data = await res.json()
      setSearchResults(data)
      setSearching(false)
    }, 300)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

const fetchNotifications = async () => {
  setLoading(true)
  try {
    const res = await fetch('/api/notifications')
    if (!res.ok) return
    const data = await res.json()
    const notifs = Array.isArray(data) ? data : []
    setNotifications(notifs)
    setUnreadCount(notifs.filter((n: any) => !n.read).length)
  } catch (err) {
    console.error('Failed to fetch notifications', err)
  } finally {
    setLoading(false)
  }
}

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markOneRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const typeIcons: Record<string, string> = {
    course: '📚',
    achievement: '🏆',
    reminder: '⏰',
    survey: '📋',
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <header className="h-16 bg-surface-900/80 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6 gap-4">
      <button className="lg:hidden btn-ghost p-2">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm hidden md:block" ref={searchRef}>
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search courses, forum..."
            className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none flex-1"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setShowResults(true)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setShowResults(false) }}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-12 left-0 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {searching ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.courses?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 px-4 py-2 uppercase tracking-wider">Courses</p>
                    {searchResults.courses.map((c: any) => (
                      <a key={c.id} href={`/courses/${c.id}`} onClick={() => setShowResults(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors">
                        <span className="text-lg">📚</span>
                        <div>
                          <p className="text-sm text-white font-medium">{c.title}</p>
                          <p className="text-xs text-slate-400">{c.category} · {c.level}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                {searchResults.users?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 px-4 py-2 uppercase tracking-wider">Users</p>
                    {searchResults.users.map((u: any) => (
                      <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors">
                        <span className="text-lg">👤</span>
                        <div>
                          <p className="text-sm text-white font-medium">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email} · {u.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.forums?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 px-4 py-2 uppercase tracking-wider">Forum</p>
                    {searchResults.forums.map((f: any) => (
                      <a key={f.id} href={`/dashboard/forum`} onClick={() => setShowResults(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors">
                        <span className="text-lg">💬</span>
                        <p className="text-sm text-white">{f.title}</p>
                      </a>
                    ))}
                  </div>
                )}
                {!searchResults.courses?.length && !searchResults.users?.length && !searchResults.forums?.length && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Notifications Bell */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications() }}
          className="btn-ghost p-2 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markOneRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-800/40 ${
                      !n.read ? 'bg-slate-800/20' : ''
                    }`}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {typeIcons[n.type] || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-snug ${n.read ? 'text-slate-300' : 'text-white'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white leading-none">{user.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user.role}</p>
        </div>
      </div>
    </header>
  )
}
