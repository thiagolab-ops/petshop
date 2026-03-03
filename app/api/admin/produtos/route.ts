import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const produtos = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Error fetching produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { name, description, price, stock, imageUrl } = data

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const produto = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
      },
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('Error creating produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
