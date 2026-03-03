import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_build'
  })
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensagem não fornecida' }, { status: 400 })
    }

    const services = await prisma.service.findMany({
      where: { isAvailable: true }
    })

    const menuInfo = services.map(p => `${p.name} - R$ ${p.price.toFixed(2)}: ${p.description}`).join('\n')

    const systemPrompt = `Você é a Sofia, a concierge virtual de alto padrão do salão Bela Estética. Sua voz é elegante e acolhedora. Ajude as clientes com dúvidas sobre manicure, tratamentos faciais e massagens. Seja breve, educada e sempre foque no bem-estar e autocuidado. Nunca mencione pizzas ou delivery.\n\nServiços oferecidos:\n${menuInfo}`

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              const sseFormatted = `data: ${JSON.stringify(chunk)}\n\n`
              controller.enqueue(encoder.encode(sseFormatted))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Erro no chat:', error)
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}

