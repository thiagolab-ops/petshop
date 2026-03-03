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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { status, estimatedTime } = body

    if (!status) {
      return NextResponse.json({ error: 'Status é obrigatório' }, { status: 400 })
    }

    // Buscar pedido atual para verificar status anterior
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id: params.id }
    })

    if (!currentAppointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData: any = { status }

    // Se estiver confirmando o pedido (de Pendente para Confirmado)
    if (status === 'Confirmado' && currentAppointment.status === 'Pendente') {
      updateData.confirmedAt = new Date()
      if (estimatedTime) {
        updateData.estimatedTime = estimatedTime
      }

      // FIDELIDADE AUTOMÁTICA: Incrementar contador do cliente
      const phone = currentAppointment.customerPhone
      if (phone) {
        // Buscar configuração de fidelidade
        const settings = await prisma.settings.findFirst()
        const purchasesNeeded = settings?.loyaltyPurchasesNeeded || 10

        // Buscar ou criar entrada de fidelidade
        let loyalty = await prisma.loyalty.findUnique({
          where: { phone }
        })

        if (loyalty) {
          // Incrementar contador
          const newCount = loyalty.purchaseCount + 1
          const hasFreeSparkles = newCount >= purchasesNeeded

          await prisma.loyalty.update({
            where: { phone },
            data: {
              purchaseCount: newCount,
              hasFreePizza: hasFreeSparkles,
            }
          })
        } else {
          // Criar nova entrada
          await prisma.loyalty.create({
            data: {
              phone,
              purchaseCount: 1,
              hasFreePizza: 1 >= purchasesNeeded,
            },
          })
        }

        // Salvar/atualizar dados do cliente para auto-preenchimento
        await prisma.customer.upsert({
          where: { phone },
          create: {
            phone,
            name: currentAppointment.customerName || undefined,
          },
          update: {
            name: currentAppointment.customerName || undefined,
          }
        })
      }
    }

    // Se for outro status e tiver tempo estimado, atualizar também
    if (estimatedTime && status !== 'Confirmado') {
      updateData.estimatedTime = estimatedTime
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 })
  }
}
