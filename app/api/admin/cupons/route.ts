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

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('Erro ao buscar cupons:', error)
    return NextResponse.json({ error: 'Erro ao buscar cupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { code, discountType, discountValue, usageLimit, validUntil } = body

    if (!code || !discountType || !discountValue || !usageLimit) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        usageLimit: parseInt(usageLimit),
        validUntil: validUntil ? new Date(validUntil) : null,
        usageCount: 0,
        isActive: true,
      }
    })

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Erro ao criar cupom:', error)
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 })
  }
}
