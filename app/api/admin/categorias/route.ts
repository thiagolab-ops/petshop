import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return false
  }
  return true
}

export async function GET() {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { services: true }
        }
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 })
    }

    // Verificar se já existe
    const existing = await prisma.category.findUnique({
      where: { name: name.trim() }
    })

    if (existing) {
      return NextResponse.json({ error: 'Já existe uma categoria com esse nome' }, { status: 400 })
    }

    // Pegar a maior ordem atual
    const maxOrder = await prisma.category.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        order: (maxOrder?.order ?? -1) + 1,
        isActive: true,
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
