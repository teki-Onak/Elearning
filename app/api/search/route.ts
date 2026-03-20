export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    if (!q || q.length < 2) return NextResponse.json({ courses: [], users: [], forums: [] })

    const isInstructor = session.user.role === 'INSTRUCTOR'
    const isAdmin = session.user.role === 'ADMIN'

    const [courses, forums] = await Promise.all([
      prisma.course.findMany({
        where: {
          isPublished: true,
          ...(isInstructor ? {
            instructors: {
              some: { instructorId: session.user.id }
            }
          } : {}),
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, category: true, level: true },
        take: 5,
      }),
      prisma.forumPost.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, createdAt: true },
        take: 3,
      }),
    ])

    // Admin can also search users
    let users: any[] = []
    if (session.user.role === 'ADMIN') {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true, role: true },
        take: 5,
      })
    }

    return NextResponse.json({ courses, users, forums })
  } catch (err) {
    console.error('[SEARCH]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
