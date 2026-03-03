'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const carouselImages = [
  'https://images.unsplash.com/photo-1560750588-73207b1ef5b8',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552693673-1bf958298935',
]

const testimonials = [
  {
    name: 'Carolina Mendes',
    text: 'O melhor atendimento e cuidado que já recebi. Minha pele está radiante e os produtos são de altíssima qualidade!',
    rating: 5,
  },
  {
    name: 'Juliana Costa',
    text: 'As massagens relaxantes são um verdadeiro refúgio da rotina. O ambiente é acolhedor e muito luxuoso.',
    rating: 5,
  },
  {
    name: 'Fernanda Lima',
    text: 'Fiz limpeza de pele e hidratação profunda. Recomendo de olhos fechados, as esteticistas têm mãos de fada!',
    rating: 5,
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredServices, setFeaturedServices] = useState<any[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)

    fetch('/api/cardapio')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.services) {
          setFeaturedServices(data.services.slice(0, 4))
        }
      })
      .catch((err) => console.error('Erro ao buscar serviços:', err))

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative w-full h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/40 z-10" />

        {carouselImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <Image
              src={img}
              alt={`Sparkles ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        ))}

        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-7xl font-bold text-white drop-shadow-md"
            >
              Bem-vinda à <span className="text-secondary drop-shadow-lg">Bela Estética</span>
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 drop-shadow"
            >
              Os melhores tratamentos estéticos com produtos premium e atendimento exclusivo
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/servicos"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Agendar Horário
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-gray-900/50 hover:bg-gray-900/70 text-white p-3 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-gray-900/50 hover:bg-gray-900/70 text-white p-3 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide
                ? 'bg-secondary w-8'
                : 'bg-white/50 hover:bg-white/70'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Serviços em Destaque */}
      {featuredServices.length > 0 && (
        <section className="py-20 bg-background border-b border-primary/10">
          <div className="container max-w-6xl mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center text-foreground mb-4"
            >
              Serviços em <span className="text-primary">Destaque</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center text-gray-500 mb-12 text-lg"
            >
              Nossos tratamentos mais procurados e exclusivos
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service, idx) => (
                <motion.div
                  key={service.id || idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  className="bg-white p-4 rounded-2xl border border-primary/20 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {service.imageUrl ? (
                      <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden">
                        <Image
                          src={service.imageUrl}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-secondary/20 flex items-center justify-center rounded-xl mb-4">
                        <Sparkles className="w-10 h-10 text-primary" />
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-2 text-foreground">{service.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-4">{service.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      R$ {Number(service.price).toFixed(2)}
                    </span>
                    <Link
                      href="/servicos"
                      className="bg-secondary/20 hover:bg-secondary/40 text-primary font-bold px-4 py-2 rounded-full text-sm transition-colors"
                    >
                      Agendar
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Depoimentos */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-foreground mb-4"
          >
            O que nossas <span className="text-primary">clientes</span> dizem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-500 mb-12 text-lg"
          >
            Confira os depoimentos de quem já experimentou nossos tratamentos
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(250, 218, 221, 0.5)' }}
                className="bg-white p-6 rounded-2xl border border-primary/20 shadow-lg text-center flex flex-col items-center"
              >
                <div className="flex gap-1 mb-4 justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed italic">"{testimonial.text}"</p>
                <p className="text-primary font-bold mt-auto">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Link
        href="/servicos"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl shadow-primary/50 hover:shadow-primary/70 hover:scale-105 transition-all flex items-center gap-2"
      >
        Agendar Horário
        <ArrowRight className="w-5 h-5" />
      </Link>
    </main>
  )
}

