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
    const { code, discountType, discountValue, usageLimit, validUntil, isActive } = body

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: code ? code.toUpperCase() : undefined,
        discountType,
        discountValue: discountValue ? parseFloat(discountValue) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive,
      }
    })

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error)
    return NextResponse.json({ error: 'Erro ao atualizar cupom' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.coupon.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir cupom:', error)
    return NextResponse.json({ error: 'Erro ao excluir cupom' }, { status: 500 })
  }
}
