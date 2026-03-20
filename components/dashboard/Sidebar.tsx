'use client'

import { Megaphone } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, TrendingUp, Heart, MessageSquare,
  Award, ClipboardList, Users, Settings, Zap, GraduationCap,
  BarChart3, LogOut, CheckCircle, BookMarked, Plus
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/enroll', label: 'Enroll', icon: Plus },
  { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
  { href: '/dashboard/units', label: 'Units', icon: BookMarked },
  { href: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/exams', label: 'Exams', icon: BarChart3 },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/progress/units', label: 'Unit Progress', icon: BarChart3 },
  { href: '/dashboard/results', label: 'My Results', icon: Award },
  { href: '/dashboard/wellbeing', label: 'Wellbeing', icon: Heart },
  { href: '/dashboard/forum', label: 'Forum', icon: MessageSquare },
  { href: '/dashboard/achievements', label: 'Achievements', icon: Award },
  { href: '/dashboard/surveys', label: 'Surveys', icon: ClipboardList },
]

const instructorNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/hod', label: 'HoD Overview', icon: GraduationCap },
  { href: '/dashboard/instructor/units', label: 'My Units', icon: BookMarked },
  { href: '/dashboard/instructor/courses', label: 'My Courses', icon: BookOpen },
  { href: '/dashboard/instructor/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/instructor/exams', label: 'Exams', icon: BarChart3 },
  { href: '/dashboard/instructor/submissions', label: 'Submissions', icon: CheckCircle },
  { href: '/dashboard/instructor/announcements', label: 'Announcements', icon: Megaphone },
  
]


const adminNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/courses', label: 'Courses', icon: GraduationCap },
  { href: '/dashboard/admin/surveys', label: 'Surveys', icon: ClipboardList },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/results', label: 'Results', icon: Award },
  { href: '/dashboard/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/dashboard/wellbeing', label: 'Wellbeing Data', icon: Heart },
]

interface SidebarProps {
  role: string
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const nav = role === 'ADMIN' ? adminNav : role === 'INSTRUCTOR' ? instructorNav : studentNav
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-surface-900 border-r border-slate-800 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">EduFlow</span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-5 pt-4 pb-2">
        <span className={cn(
          'badge text-xs',
          role === 'ADMIN' ? 'badge-warning' : role === 'INSTRUCTOR' ? 'badge-primary' : 'badge-success'
        )}>
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {nav.map((item) => {
        const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', isActive && 'active')}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-800 space-y-0.5">
        <Link href="/dashboard/settings" className="nav-item">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
