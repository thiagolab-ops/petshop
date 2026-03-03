'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { toast } from '@/hooks/use-toast'
import { mockCategories, mockServices, mockSettings } from '@/lib/mock-data'
import AddToCartButton from '@/components/AddToCartButton'

export default function ServicosPage() {
    const [services, setServices] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [discount, setDiscount] = useState(0)
    const [selectedFilter, setSelectedFilter] = useState<string>('Todos')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const { items, addItem } = useCart()
    const itemCount = items?.length || 0

    useEffect(() => {
        fetchCardapio()
    }, [])

    const fetchCardapio = async () => {
        try {
            const res = await fetch('/api/cardapio')
            if (!res.ok) throw new Error('API Error')
            const data = await res.json()
            setServices(data.services || [])
            setCategories(data.categories || [])
            setDiscount(data.discount || 0)
        } catch (error) {
            // Fallback
            setServices(mockServices)
            setCategories(mockCategories)
            setDiscount(mockSettings.discountActive ? mockSettings.discountPercentage : 0)
        } finally {
            setLoading(false)
        }
    }

    const filters = ['Todos', 'Promoção', 'Novidade', 'Mais Buscado']

    const filteredServices = services.filter(service => {
        let matchesFilter = true
        if (selectedFilter !== 'Todos') {
            if (selectedFilter === 'Novidade') matchesFilter = service.isNew
            else if (selectedFilter === 'Mais Buscado') matchesFilter = service.isBestSeller
        }
        let matchesSearch = true
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase()
            matchesSearch = service.name.toLowerCase().includes(lowerTerm) || service.description.toLowerCase().includes(lowerTerm)
        }
        return matchesFilter && matchesSearch
    })

    const getServicesByCategory = (categoryName: string) => {
        return filteredServices.filter(p => p.category === categoryName)
    }

    const handleAddToCart = (service: any) => {
        const price = discount > 0 ? service.price * (1 - discount / 100) : service.price
        addItem({
            id: service.id,
            name: service.name,
            price: price,
            quantity: 1,
            imageUrl: service.imageUrl,
        })
        toast({
            title: 'Serviço selecionado!',
            description: `${service.name} foi adicionado à sua lista.`,
            className: 'bg-white border-brand-rose text-brand-dark font-medium'
        })
    }

    const getServicePriceDisplay = (service: any) => {
        if (discount > 0) {
            const discountedPrice = service.price * (1 - discount / 100)
            return (
                <div className="flex flex-col">
                    <span className="text-xs text-stone-400 line-through">R$ {service.price.toFixed(2)}</span>
                    <span className="font-heading text-lg font-semibold text-brand-dark">
                        R$ {discountedPrice.toFixed(2)}
                    </span>
                </div>
            )
        }
        return (
            <div className="flex flex-col">
                <span className="text-xs text-stone-500">Preço</span>
                <span className="font-heading text-lg font-bold text-brand-dark">
                    R$ {service.price.toFixed(2)}
                </span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-nude flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand-gold animate-pulse" />
            </div>
        )
    }

    return (
        <div className="bg-brand-nude min-h-screen antialiased selection:bg-brand-rose selection:text-white font-sans w-full">
            {/* Header Flutuante Expansivo */}
            <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 px-6 lg:px-12 py-4 backdrop-blur-md border-b border-stone-200 w-full shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center justify-center rounded-full p-2 text-brand-dark hover:bg-stone-100 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-heading font-bold tracking-tight text-brand-dark">
                        BELA <span className="italic text-brand-gold">Estética</span>
                    </h1>
                </div>
                <Link
                    href="/carrinho"
                    className="relative flex items-center justify-center h-10 w-10 rounded-full bg-brand-dark text-white shadow-sm hover:scale-105 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-rose text-[10px] font-bold text-white border-2 border-brand-nude">
                            {itemCount}
                        </span>
                    )}
                </Link>
            </header>

            {/* Container Principal Expandido (Aqui estava o erro) */}
            <div className="w-full max-w-[1400px] mx-auto px-6 pt-8 pb-24">

                {/* Search & Filters */}
                <div className="mb-10 text-center md:text-left">
                    <h2 className="mb-2 text-4xl lg:text-5xl font-light leading-tight text-brand-dark">
                        Nossos <span className="italic font-heading text-brand-gold">Procedimentos</span>
                    </h2>
                    <div className="relative mt-8 max-w-xl mx-auto md:mx-0">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                            search
                        </span>
                        <input
                            className="w-full rounded-full border border-stone-200 bg-white py-4 pl-12 pr-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-brand-dark placeholder-stone-400 transition-shadow"
                            placeholder="Buscar tratamento (ex: Limpeza, Botox)..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex w-full gap-3 overflow-x-auto py-2 mb-10 no-scrollbar justify-start md:justify-start" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`whitespace-nowrap px-6 py-2.5 text-sm font-bold transition-all ${selectedFilter === filter
                                ? 'rounded-full bg-brand-gold text-white shadow-md transform scale-105'
                                : 'rounded-full border border-stone-200 bg-white text-stone-600 hover:border-brand-gold/50 hover:text-brand-dark'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Lista de Serviços (Cards) com CSS Grid */}
                <main className="flex flex-col gap-16">
                    {categories.map((category) => {
                        const categoryServices = getServicesByCategory(category.name)
                        if (categoryServices.length === 0) return null
                        return (
                            <section key={category.id} className="space-y-8">
                                <h2 className="text-2xl lg:text-3xl font-heading font-light text-brand-dark flex items-center gap-3 border-b border-stone-200 pb-3">
                                    <Sparkles className="w-6 h-6 text-brand-gold" />
                                    {category.name}
                                </h2>

                                {/* O GRID INFALÍVEL APLICADO DENTRO DO WRAPPER CERTO */}
                                <div style={{ display: 'block', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
                                    {categoryServices.map((service: any) => (
                                        <div
                                            key={service.id}
                                            style={{
                                                display: 'inline-block',
                                                verticalAlign: 'top',
                                                width: '100%',
                                                maxWidth: '350px',
                                                margin: '16px',
                                                textAlign: 'left'
                                            }}
                                            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                        >
                                            <div className="w-full h-64 relative bg-stone-50 overflow-hidden cursor-pointer" onClick={() => window.location.href = `/servicos/${service.id}`}>
                                                {service.imageUrl ? (
                                                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-400">Sem Imagem</div>
                                                )}
                                            </div>
                                            <div className="p-6 cursor-pointer" onClick={() => window.location.href = `/servicos/${service.id}`}>
                                                <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-rose transition-colors line-clamp-1">{service.name}</h3>
                                                <p className="text-brand-gold font-bold text-2xl mt-2">R$ {Number(service.price).toFixed(2).replace('.', ',')}</p>
                                                <p className="text-stone-500 text-sm mt-3 line-clamp-2 leading-relaxed">{service.description}</p>
                                            </div>
                                            <div className="p-6 pt-0">
                                                <AddToCartButton service={service} className="w-full py-4 rounded-xl bg-brand-rose text-white text-lg font-bold hover:bg-brand-rose/90 transition-colors shadow-md hover:shadow-lg block text-center" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                    {filteredServices.length === 0 && (
                        <div className="text-center py-20 text-stone-500 font-light text-lg">
                            Nenhum tratamento encontrado com esses filtros.
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
