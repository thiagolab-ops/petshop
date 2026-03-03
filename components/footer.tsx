'use client'

import { Phone, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-background border-t border-primary/20 text-foreground py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-primary font-bold text-lg">Contato</h3>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span>(11) 99999-9999</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Rua das Flores, 123 - Vila Mariana, São Paulo</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-primary font-bold text-lg">Horário</h3>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>Seg - Dom: 09h - 20h</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-primary font-bold text-lg">Bela Estética</h3>
            <p className="text-sm text-gray-500">
              Os melhores tratamentos estéticos com atendimento profissional e exclusivo. Seu bem-estar é a nossa prioridade.
            </p>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-6 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Bela Estética. Todos os direitos reservados.</p>
          <a href="/admin" className="text-primary hover:text-primary/80 transition-colors font-medium">Área Restrita (Admin)</a>
        </div>
      </div>
    </footer>
  )
}
