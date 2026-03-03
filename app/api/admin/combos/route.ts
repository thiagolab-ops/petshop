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

    const combos = await prisma.combo.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ combos })
  } catch (error) {
    console.error('Erro ao buscar combos:', error)
    return NextResponse.json({ error: 'Erro ao buscar combos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, price, description, serviceIds, imageUrl } = body

    if (!name || !price || !description || !serviceIds) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const combo = await prisma.combo.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        serviceIds,
        imageUrl: imageUrl || null,
        isActive: true,
      }
    })

    return NextResponse.json({ combo }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar combo:', error)
    return NextResponse.json({ error: 'Erro ao criar combo' }, { status: 500 })
  }
}
