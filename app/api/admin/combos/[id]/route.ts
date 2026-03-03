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
    const { name, price, description, serviceIds, imageUrl, isActive } = body

    const combo = await prisma.combo.update({
      where: { id: params.id },
      data: {
        name,
        price: parseFloat(price),
        description,
        serviceIds,
        imageUrl: imageUrl || null,
        isActive: isActive !== false,
      }
    })

    return NextResponse.json({ combo })
  } catch (error) {
    console.error('Erro ao atualizar combo:', error)
    return NextResponse.json({ error: 'Erro ao atualizar combo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.combo.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar combo:', error)
    return NextResponse.json({ error: 'Erro ao deletar combo' }, { status: 500 })
  }
}
