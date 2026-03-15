import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar role={session.user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={session.user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} EduFlow Learning Platform</span>
          <span>Designed & Built by <span className="text-primary-400 font-medium">Obinna Kelvin</span></span>
        </footer>
      </div>
    </div>
  )
}
