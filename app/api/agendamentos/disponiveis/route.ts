import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const dateParam = searchParams.get('date')

        if (!dateParam) {
            return NextResponse.json(
                { error: 'Parâmetro data é obrigatório (YYYY-MM-DD)' },
                { status: 400 }
            )
        }

        // Criar datas para o início e fim do dia selecionado
        const selectedDate = new Date(dateParam)
        const startDate = new Date(selectedDate.setHours(0, 0, 0, 0))
        const endDate = new Date(selectedDate.setHours(23, 59, 59, 999))

        // Buscar agendamentos que já existem neste dia e não estão cancelados
        const existingAppointments = await prisma.appointment.findMany({
            where: {
                scheduledTime: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    not: 'CANCELED'
                }
            },
            select: {
                scheduledTime: true
            }
        })

        // Extrair os horários que já estão ocupados (formatados como HH:mm)
        const occupiedTimeStrings = existingAppointments.map(app => {
            const hours = app.scheduledTime.getHours().toString().padStart(2, '0')
            const minutes = app.scheduledTime.getMinutes().toString().padStart(2, '0')
            return `${hours}:${minutes}`
        })

        // Gerar horários disponíveis das 08:00 às 19:00, com intervalo de 1 hora
        const allSlots = []
        for (let hour = 8; hour <= 19; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`
            allSlots.push(timeString)
        }

        // Filtrar os horários, removendo os ocupados
        // Também podemos remover horários no passado se for o dia de hoje
        const now = new Date()
        const isToday = startDate.toDateString() === now.toDateString()

        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        const availableSlots = allSlots.filter(timeString => {
            // 1. Verificar se já não está ocupado
            if (occupiedTimeStrings.includes(timeString)) {
                return false
            }

            // 2. Se for hoje, verificar se o horário já passou
            if (isToday) {
                const [hourStr, minStr] = timeString.split(':')
                const slotHour = parseInt(hourStr)
                const slotMin = parseInt(minStr)

                if (slotHour < currentHour || (slotHour === currentHour && slotMin <= currentMinute)) {
                    return false
                }
            }

            return true
        })

        return NextResponse.json({
            date: dateParam,
            availableSlots
        })
    } catch (error) {
        console.error('Erro ao buscar horários disponíveis:', error)
        return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 })
    }
}
