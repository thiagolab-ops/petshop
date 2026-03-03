import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const servicos = await prisma.service.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(servicos)
    } catch (error) {
        console.error('Error fetching serviços:', error)
        return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const { name, description, price, durationMinutes, imageUrl } = data

        if (!name || price === undefined || durationMinutes === undefined) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
        }

        const servico = await prisma.service.create({
            data: {
                name,
                description,
                price,
                durationMinutes,
                imageUrl,
            },
        })

        return NextResponse.json(servico, { status: 201 })
    } catch (error) {
        console.error('Error creating serviço:', error)
        return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 })
    }
}
