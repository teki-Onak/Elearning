export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Reply content is required.' }, { status: 400 })

    const reply = await prisma.forumReply.create({
      data: { content, userId: session.user.id, postId: params.postId },
      include: { user: { select: { name: true } } },
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to post reply.' }, { status: 500 })
  }
}
