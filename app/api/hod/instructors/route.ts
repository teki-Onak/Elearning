export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Allow Admin or anyone assigned as HoD
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    const hodAssignment = await prisma.courseHoD.findFirst({
      where: { hodId: session.user.id },
    })

    if (!dbUser || (dbUser.role !== 'ADMIN' && !hodAssignment)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const instructors = await prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ users: instructors })
  } catch (err) {
    console.error('[HOD_INSTRUCTORS]', err)
    return NextResponse.json({ error: 'Failed to fetch instructors' }, { status: 500 })
  }
}
