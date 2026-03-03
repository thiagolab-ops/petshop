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

export async function GET() {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
  }
}
