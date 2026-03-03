import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// API pública para listar categorias ativas
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        order: true,
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({ categories: [] })
  }
}
