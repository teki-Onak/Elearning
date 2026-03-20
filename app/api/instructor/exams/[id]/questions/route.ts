export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const questions = await prisma.examQuestion.findMany({
      where: { examId: params.id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(questions ?? [])
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { text, type, options, answer, marks } = body
    if (!text || !answer) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const count = await prisma.examQuestion.count({ where: { examId: params.id } })
    const question = await prisma.examQuestion.create({
      data: {
        examId: params.id,
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
    return NextResponse.json({ error: 'Failed to add question' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { questionId } = await req.json()
    await prisma.examQuestion.delete({ where: { id: questionId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
