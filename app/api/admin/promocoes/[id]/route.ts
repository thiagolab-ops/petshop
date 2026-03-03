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
    const { name, description, serviceIds, discountPercentage, startDate, endDate, isActive } = body

    const promotion = await prisma.promotion.update({
      where: { id: params.id },
      data: {
        name,
        description,
        serviceIds,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      }
    })

    return NextResponse.json({ promotion })
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error)
    return NextResponse.json({ error: 'Erro ao atualizar promoção' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.promotion.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir promoção:', error)
    return NextResponse.json({ error: 'Erro ao excluir promoção' }, { status: 500 })
  }
}
