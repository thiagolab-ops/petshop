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

// GET - Listar todos os clientes fidelidade
export async function GET() {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const customers = await prisma.loyalty.findMany({
      orderBy: { purchaseCount: 'desc' }
    })

    const settings = await prisma.settings.findFirst()

    return NextResponse.json({
      customers,
      purchasesNeeded: settings?.loyaltyPurchasesNeeded || 10
    })
  } catch (error) {
    console.error('Erro ao buscar fidelidade:', error)
    return NextResponse.json({ error: 'Erro ao buscar fidelidade' }, { status: 500 })
  }
}

// POST - Resgatar serviço grátis (zerar contador)
export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, action } = body

    if (!phone || !action) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    if (action === 'redeem') {
      // Resgatar serviço grátis - zerar contador
      const loyalty = await prisma.loyalty.update({
        where: { phone },
        data: {
          purchaseCount: 0,
          hasFreePizza: false,
        }
      })

      return NextResponse.json({ success: true, loyalty })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao processar fidelidade:', error)
    return NextResponse.json({ error: 'Erro ao processar fidelidade' }, { status: 500 })
  }
}

// PUT - Atualizar configurações de fidelidade
export async function PUT(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { loyaltyPurchasesNeeded } = body

    const settings = await prisma.settings.findFirst()

    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: { loyaltyPurchasesNeeded: parseInt(loyaltyPurchasesNeeded) }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 })
  }
}
