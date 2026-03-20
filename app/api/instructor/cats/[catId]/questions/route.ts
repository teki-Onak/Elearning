export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const questions = await prisma.cATQuestion.findMany({
      where: { catId: params.catId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(questions ?? [])
  } catch (err) {
    console.error('[CAT_QUESTIONS_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, type, options, answer, marks } = await req.json()
    if (!text || !answer) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const count = await prisma.cATQuestion.count({ where: { catId: params.catId } })

    const question = await prisma.cATQuestion.create({
      data: {
        catId: params.catId,
        text,
        type: type || 'MCQ',
        options: options || [],
        answer,
        marks: Number(marks) || 1,
        order: count + 1,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (err) {
    console.error('[CAT_QUESTIONS_POST]', err)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { catId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { questionId } = await req.json()
    await prisma.cATQuestion.delete({ where: { id: questionId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
