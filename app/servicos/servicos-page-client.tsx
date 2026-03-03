'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Scissors } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'

export default function ServicosPageClient({ initialServices }: { initialServices: any[] }) {
    const [searchTerm, setSearchTerm] = useState('')

    // HYDRATION FIX: Prevent Zustand cart rendering until mounted
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const items = useCartStore((state) => state.items)
    const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    const filteredServices = initialServices.filter(service => {
        if (!searchTerm) return true
        const lowerTerm = searchTerm.toLowerCase()
        return service.name.toLowerCase().includes(lowerTerm) ||
            (service.description && service.description.toLowerCase().includes(lowerTerm))
    })

    const handleAgendar = (serviceName: string) => {
        // Redirecionamento visual/log apenas por enquanto, conform solicitado
        console.log(`Iniciando agendamento para: ${serviceName}`)
        alert(`Redirecionando para o agendamento de: ${serviceName} (Em breve!)`)
    }

    return (
        <div className="bg-stone-50 min-h-screen font-sans w-full">
            {/* Header Flutuante com proteção de hidratação */}
            <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 px-6 lg:px-12 py-4 backdrop-blur-md border-b border-stone-200 w-full shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-stone-400 hover:text-stone-600 transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-heading font-bold tracking-widest text-brand-dark">
                        <span className="italic text-brand-gold" style={{ color: '#D4AF37' }}>Pet</span>Care
                    </h1>
                </div>
                <nav className="flex items-center gap-6">
                    <Link href="/loja/carrinho" className="relative text-stone-600 hover:text-brand-dark transition flex items-center gap-2">
                        <div className="relative">
                            {/* Usa icone de sacola simple ao inves de material-symbols */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            {mounted && cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-brand-gold text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#D4AF37' }}>
                                    {cartItemCount}
                                </span>
                            )}
                        </div>
                    </Link>
                </nav>
            </header>

            {/* Container Principal */}
            <div className="w-full max-w-7xl mx-auto px-6 pt-12 pb-24">

                <div className="mb-12 text-center md:text-left">
                    <h2 className="mb-4 text-3xl md:text-4xl font-bold text-stone-800">
                        Nossos <span className="italic font-heading text-brand-gold" style={{ color: '#D4AF37' }}>Serviços</span>
                    </h2>
                    <p className="text-stone-500 max-w-2xl mb-8">
                        Banho, tosa e cuidados especiais para o seu pet com o maior carinho do mundo.
                    </p>

                    <div className="relative max-w-xl mx-auto md:mx-0">
                        <input
                            className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-4 pr-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-stone-800 placeholder-stone-400 transition-shadow"
                            placeholder="Buscar serviço (ex: Banho)..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <main className="flex flex-col gap-16">
                    {initialServices.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-100 flex flex-col items-center justify-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 text-stone-300">
                                <Scissors size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-800 mb-2">Sem Serviços</h3>
                            <p className="text-stone-500">Nenhum serviço foi cadastrado no painel admin ainda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredServices.map((service: any) => (
                                <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 flex flex-col group">
                                    <div className="w-full h-56 relative bg-stone-50 overflow-hidden border-b border-stone-50 flex items-center justify-center">
                                        {service.imageUrl ? (
                                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <Scissors className="text-stone-300 w-16 h-16" />
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-stone-800 font-bold px-3 py-1 rounded-full text-xs shadow-sm border border-stone-100 flex items-center gap-1">
                                            <span>⏱️</span> {service.durationMinutes} min
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="mb-4 flex-1">
                                            <h3 className="text-xl font-bold text-stone-800 leading-snug mb-2">{service.name}</h3>
                                            <p className="text-stone-500 text-sm line-clamp-2">{service.description || 'Sem descrição.'}</p>
                                        </div>

                                        <div className="mt-auto">
                                            <p className="text-2xl font-black text-brand-dark tracking-tight mb-4" style={{ color: '#2A2A2A' }}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                            </p>

                                            <button
                                                onClick={() => handleAgendar(service.name)}
                                                className="w-full py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
                                                style={{ backgroundColor: '#D9777F' }} // Tom rose/pastel para combinar com estética
                                            >
                                                <Scissors size={18} />
                                                Agendar Horário
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredServices.length === 0 && searchTerm && (
                                <div className="col-span-full text-center py-20 text-stone-500">
                                    Nenhum serviço encontrado para "{searchTerm}".
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
