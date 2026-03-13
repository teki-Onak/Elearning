import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, content, videoUrl } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const count = await prisma.lesson.count({ where: { moduleId: params.unitId } })

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl,
        moduleId: params.unitId,
        order: count + 1,
        type: 'TEXT',
      },
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (err) {
    console.error('[NOTES_POST]', err)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { unitId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lessonId } = await req.json()
    await prisma.lesson.delete({ where: { id: lessonId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
