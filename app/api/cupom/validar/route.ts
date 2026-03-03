import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Validar e aplicar cupom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code) {
      return NextResponse.json({ error: 'Código do cupom não fornecido' }, { status: 400 })
    }

    // Buscar cupom
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Cupom não encontrado' 
      })
    }

    // Verificar se está ativo
    if (!coupon.isActive) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Cupom desativado' 
      })
    }

    // Verificar validade
    if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Cupom expirado' 
      })
    }

    // Verificar limite de uso
    if (coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Cupom esgotado' 
      })
    }

    // Calcular desconto
    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100
    } else {
      discount = Math.min(coupon.discountValue, subtotal)
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: Math.round(discount * 100) / 100,
    })
  } catch (error) {
    console.error('Erro ao validar cupom:', error)
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 })
  }
}
