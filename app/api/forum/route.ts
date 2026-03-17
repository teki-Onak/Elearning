import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.forumPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true } },
        replies: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return NextResponse.json(posts)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch posts.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Please log in to post.' }, { status: 401 })

    const { title, content, courseId } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Title and content required.' }, { status: 400 })

    const post = await prisma.forumPost.create({
      data: { title, content, userId: session.user.id, courseId: courseId ?? null },
      include: {
        user: { select: { name: true } },
        replies: { include: { user: { select: { name: true } } } },
      },
    })
    await checkAndAwardAchievements(session.user.id)
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 })
  }
}
