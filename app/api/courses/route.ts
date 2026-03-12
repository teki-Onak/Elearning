import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
        ...(level && { level: level as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        _count: { select: { enrollments: true, modules: true } },
        modules: {
          include: { _count: { select: { lessons: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(courses)
  } catch (err) {
    console.error('[COURSES_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch courses.' }, { status: 500 })
  }
}

const createCourseSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string().min(1),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  duration: z.number().positive(),
  thumbnail: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['INSTRUCTOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = createCourseSchema.parse(body)

    const course = await prisma.course.create({ data: validated })
    return NextResponse.json(course, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[COURSES_POST]', err)
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 })
  }
}
