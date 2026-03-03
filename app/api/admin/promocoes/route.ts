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

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('Erro ao buscar promoções:', error)
    return NextResponse.json({ error: 'Erro ao buscar promoções' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, serviceIds, discountPercentage, startDate, endDate } = body

    if (!name || !serviceIds || !discountPercentage || !startDate || !endDate) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description: description || '',
        serviceIds,
        discountPercentage: parseFloat(discountPercentage),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      }
    })

    return NextResponse.json({ promotion })
  } catch (error) {
    console.error('Erro ao criar promoção:', error)
    return NextResponse.json({ error: 'Erro ao criar promoção' }, { status: 500 })
  }
}
