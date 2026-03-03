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

    let settings = await prisma.settings.findFirst()

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          discountPercentage: 0,
          discountActive: false,
          loyaltyPurchasesNeeded: 10,
          whatsappNumber: '5511999999999',
          pixKey: 'belaestetica@pix.com.br',
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { discountPercentage, discountActive, loyaltyPurchasesNeeded, pixKey } = body

    let settings = await prisma.settings.findFirst()

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          discountPercentage: parseFloat(discountPercentage || 0),
          discountActive: discountActive || false,
          loyaltyPurchasesNeeded: parseInt(loyaltyPurchasesNeeded || 10),
          whatsappNumber: '5511999999999',
          pixKey: pixKey || 'belaestetica@pix.com.br',
        }
      })
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          discountPercentage: discountPercentage !== undefined ? parseFloat(discountPercentage) : settings.discountPercentage,
          discountActive: discountActive !== undefined ? discountActive : settings.discountActive,
          loyaltyPurchasesNeeded: loyaltyPurchasesNeeded !== undefined ? parseInt(loyaltyPurchasesNeeded) : settings.loyaltyPurchasesNeeded,
          pixKey: pixKey !== undefined ? pixKey : settings.pixKey,
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 })
  }
}
