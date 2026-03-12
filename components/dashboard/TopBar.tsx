'use client'

import { useState } from 'react'
import { Bell, Search, Menu } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface TopBarProps {
  user: { name: string; email: string; role: string }
}

export default function TopBar({ user }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="h-16 bg-surface-900/80 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6 gap-4">
      {/* Mobile menu */}
      <button className="lg:hidden btn-ghost p-2">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search courses..."
          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none flex-1"
        />
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="btn-ghost p-2 relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 card border-slate-700 shadow-2xl z-50 animate-slide-up">
            <h3 className="font-semibold text-white text-sm mb-3">Notifications</h3>
            <p className="text-slate-400 text-sm">Notifications load dynamically from the API.</p>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
          {getInitials(user.name)}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white leading-none">{user.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user.role}</p>
        </div>
      </div>
    </header>
  )
}
