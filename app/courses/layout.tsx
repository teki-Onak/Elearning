import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Zap, LayoutDashboard, ArrowLeft } from 'lucide-react'

export default async function CoursesLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-surface-950">
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-surface-950/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-white">EduFlow</span>
          </Link>

          <div className="flex-1" />

          {session ? (
            <Link href="/dashboard" className="btn-ghost text-sm flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="btn-ghost text-sm">Log In</Link>
              <Link href="/register" className="btn-primary text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
