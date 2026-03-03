"use client"

import Link from 'next/link'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useEffect, useState } from 'react'

export function StoreHeader() {
    const items = useCartStore((state) => state.items)
    const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    // To avoid hydration mismatch where localstorage loads later
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <header className="bg-white border-b border-stone-100 py-4 px-6 md:px-12 sticky top-0 z-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-stone-400 hover:text-stone-600 transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-heading text-2xl font-bold tracking-widest text-brand-dark">
                    <span className="text-brand-gold italic">Pet</span>Store
                </h1>
            </div>

            <nav className="flex items-center gap-6">
                <Link href="/loja/carrinho" className="relative text-stone-600 hover:text-brand-dark transition flex items-center gap-2">
                    <div className="relative">
                        <ShoppingCart size={24} />
                        {mounted && cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-gold text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#D4AF37' }}>
                                {cartItemCount}
                            </span>
                        )}
                    </div>
                    <span className="font-medium hidden sm:inline">Carrinho</span>
                </Link>
            </nav>
        </header>
    )
}
