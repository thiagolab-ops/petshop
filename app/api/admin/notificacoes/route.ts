import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['All'],
        contents: { en: message, pt: message },
        headings: { en: 'Bela Estética', pt: 'Bela Estética' },
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar notificação')
    }

    const result = await response.json()

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return NextResponse.json({ error: 'Erro ao enviar notificação' }, { status: 500 })
  }
}
