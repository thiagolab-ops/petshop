import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Incrementar uso do cupom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponId } = body

    if (!couponId) {
      return NextResponse.json({ error: 'ID do cupom não fornecido' }, { status: 400 })
    }

    // Incrementar contador de uso
    await prisma.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao usar cupom:', error)
    return NextResponse.json({ error: 'Erro ao usar cupom' }, { status: 500 })
  }
}
