'use client'

import { useEffect, useState } from 'react'
import { Users, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)

    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users)
    setTotal(data.total)
    setTotalPages(data.totalPages)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    if (res.ok) {
      toast.success('User role updated')
      fetchUsers()
    } else {
      toast.error('Failed to update role')
    }
  }

  const roleColors: Record<string, string> = {
    STUDENT: 'badge-success',
    INSTRUCTOR: 'badge-primary',
    ADMIN: 'badge-warning',
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-primary-400" /> User Management
        </h1>
        <p className="text-slate-400 mt-1">{total} total users registered</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="input max-w-40"
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="INSTRUCTOR">Instructors</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider p-4">User</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider p-4">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider p-4">Enrollments</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider p-4">Joined</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id} className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors ${i === users.length - 1 ? 'border-0' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.name}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${roleColors[user.role] || 'badge-primary'}`}>{user.role}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 text-sm">{user._count.enrollments}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400 text-sm">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary-500"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-2 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
