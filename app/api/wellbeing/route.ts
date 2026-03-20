export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const logSchema = z.object({
  mood: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  note: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const validated = logSchema.parse(body)

    const log = await prisma.wellbeingLog.create({
      data: { userId: session.user.id, ...validated },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[WELLBEING_POST]', err)
    return NextResponse.json({ error: 'Failed to log wellbeing.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') ?? '30')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const logs = await prisma.wellbeingLog.findMany({
      where: { userId: session.user.id, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(logs)
  } catch (err) {
    console.error('[WELLBEING_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch wellbeing data.' }, { status: 500 })
  }
}
