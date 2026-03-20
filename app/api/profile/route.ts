export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, bio, avatar, currentPassword, newPassword } = await req.json()

    if (newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      const hashed = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })
      return NextResponse.json({ success: true })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio, avatar },
      select: { id: true, name: true, email: true, bio: true, avatar: true, role: true },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PROFILE_PATCH]', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
