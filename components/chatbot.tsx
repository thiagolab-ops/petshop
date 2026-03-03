'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Olá! 👋 Bem-vindo à Bela Estética! Como posso ajudar você hoje?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('openChat', handleOpen)
    return () => window.removeEventListener('openChat', handleOpen)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) throw new Error('Erro na resposta')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let assistantMessage = ''
      let partialRead = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                assistantMessage += content
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Ignorar erros de parse
            }
          }
        }
      }

      // Verificar se precisa redirecionar para WhatsApp
      if (assistantMessage.includes('wa.me/5511999999999')) {
        setTimeout(() => {
          window.open('https://wa.me/5511999999999?text=Ol%C3%A1%2C%20vim%20pelo%20site', '_blank')
        }, 2000)
      }
    } catch (error) {
      console.error('Erro no chat:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato pelo WhatsApp: (11) 99999-9999'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && !isHome && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#D4AF37] rounded-full shadow-lg shadow-[#D4AF37]/40 flex items-center justify-center transition-all"
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-gray-900 rounded-2xl shadow-xl shadow-black/50 border border-[#D4AF37]/30 flex flex-col overflow-hidden"
          >
            <div className="bg-[#D4AF37] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="font-bold text-white">Bela Estética Bot</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-gray-800 text-white border border-[#D4AF37]/20'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-lg border border-[#D4AF37]/20">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[#D4AF37]/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:outline-none disabled:opacity-50 placeholder:text-gray-500"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#D4AF37] text-white p-2 rounded-lg hover:bg-[#B5952F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
