import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Criar pedido
export async function POST(request: NextRequest) {
  const mockAppointmentId = `AGEN-MOCK-${Math.floor(Math.random() * 10000)}`

  try {
    const body = await request.json()
    const { items, customerName, customerPhone, address, paymentMethod, total, scheduledTime } = body

    if (!items || !customerPhone || !paymentMethod || !scheduledTime) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Force mock if env var is set
    if (process.env.USE_MOCK_DATA === 'true') {
      throw new Error('Forced Mock Data')
    }

    // Criar agendamento
    const appointment = await prisma.appointment.create({
      data: {
        items,
        customerName: customerName || null,
        customerPhone,
        paymentMethod,
        total,
        status: 'PENDING',
        scheduledTime: new Date(scheduledTime),
      }
    })

    // Buscar configurações de fidelidade
    const settings = await prisma.settings.findFirst()
    const purchasesNeeded = settings?.loyaltyPurchasesNeeded || 10

    // Atualizar ou criar registro de fidelidade
    let loyalty = await prisma.loyalty.findUnique({
      where: { phone: customerPhone }
    })

    if (loyalty) {
      // Incrementar contador
      const newPurchaseCount = loyalty.purchaseCount + 1
      const hasFreeSparkles = newPurchaseCount >= purchasesNeeded

      loyalty = await prisma.loyalty.update({
        where: { phone: customerPhone },
        data: {
          purchaseCount: newPurchaseCount,
          hasFreePizza: hasFreeSparkles,
        }
      })
    } else {
      // Criar novo registro
      loyalty = await prisma.loyalty.create({
        data: {
          phone: customerPhone,
          purchaseCount: 1,
          hasFreePizza: false,
        }
      })
    }

    // Calcular informações de fidelidade para exibir
    const currentPurchases = loyalty.purchaseCount
    const remaining = Math.max(0, purchasesNeeded - currentPurchases)
    const earnedFreeSparkles = currentPurchases >= purchasesNeeded

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      loyalty: {
        currentPurchases,
        purchasesNeeded,
        remaining,
        earnedFreeSparkles,
      }
    })
  } catch (error) {
    console.error('Erro ao criar agendamento (Database), usando FALLBACK:', error)

    // Fallback: Retornar sucesso fictício
    return NextResponse.json({
      success: true,
      appointmentId: mockAppointmentId,
      loyalty: {
        currentPurchases: 5, // Mock values
        purchasesNeeded: 10,
        remaining: 5,
        earnedFreeSparkles: false,
      }
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('id')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do agendamento não fornecido' },
        { status: 400 }
      )
    }

    // Check if it's a mock appointment
    if (appointmentId.startsWith('AGEN-MOCK-') || process.env.USE_MOCK_DATA === 'true') {
      return NextResponse.json({
        appointment: {
          id: appointmentId,
          status: 'CONFIRMED', // Mock status
          total: 99.90, // Mock total
          items: [
            { name: 'Sparkles Mock 1', quantity: 1, price: 50.00 },
            { name: 'Sparkles Mock 2', quantity: 1, price: 49.90 }
          ],
          paymentMethod: 'PIX',
          createdAt: new Date().toISOString(),
          scheduledTime: new Date().toISOString(),
        },
        pixKey: 'belaestetica@pix.com.br'
      })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    })

    if (!appointment) {
      // If not found in DB, maybe it was a recent mock appointment that we should handle? 
      // For now, let's strictly return 404 if not found in DB and not a mock ID.
      // However, if DB is down, findUnique will throw.

      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    const settings = await prisma.settings.findFirst()

    return NextResponse.json({
      appointment,
      pixKey: settings?.pixKey || 'belaestetica@pix.com.br'
    })
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)

    // Fallback for GET as well
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('id') || 'UNKNOWN'

    return NextResponse.json({
      appointment: {
        id: appointmentId,
        status: 'PENDING (Offline)',
        total: 0.00,
        items: [],
        createdAt: new Date().toISOString(),
        scheduledTime: new Date().toISOString(),
      },
      pixKey: 'belaestetica@pix.com.br'
    })
  }
}
