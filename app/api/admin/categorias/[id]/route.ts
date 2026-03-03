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

    const { id } = params
    const body = await request.json()
    const { name, order, isActive } = body

    // Verificar se nome já existe em outra categoria
    if (name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: name.trim(),
          NOT: { id }
        }
      })

      if (existing) {
        return NextResponse.json({ error: 'Já existe uma categoria com esse nome' }, { status: 400 })
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params

    // Verificar se tem produtos vinculados
    const servicesCount = await prisma.service.count({
      where: { categoryId: id }
    })

    if (servicesCount > 0) {
      // Remover vínculo dos produtos (não excluir os produtos)
      await prisma.service.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      })
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, servicesUpdated: servicesCount })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 })
  }
}
