import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// API pública para obter configurações de entrega
export async function GET() {
  try {
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

    // Retornar apenas informações públicas
    return NextResponse.json({
      pixKey: settings.pixKey,
      discountPercentage: settings.discountActive ? settings.discountPercentage : 0,
      discountActive: settings.discountActive,
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({
      pixKey: 'belaestetica@pix.com.br',
      discountPercentage: 0,
      discountActive: false,
    })
  }
}
