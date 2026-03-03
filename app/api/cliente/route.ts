import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Buscar cliente por telefone (auto-preenchimento)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Telefone não fornecido' }, { status: 400 })
    }

    // Buscar dados do cliente
    const customer = await prisma.customer.findUnique({
      where: { phone }
    })

    // Buscar dados de fidelidade
    const loyalty = await prisma.loyalty.findUnique({
      where: { phone }
    })

    // Buscar configurações de fidelidade
    const settings = await prisma.settings.findFirst()
    const purchasesNeeded = settings?.loyaltyPurchasesNeeded || 10

    return NextResponse.json({
      customer: customer || null,
      loyalty: loyalty ? {
        ...loyalty,
        purchasesNeeded,
      } : null
    })
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 })
  }
}
