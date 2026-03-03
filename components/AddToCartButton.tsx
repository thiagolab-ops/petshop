"use client"

import { useCartStore } from '@/store/cart-store'
import { Product } from '@prisma/client'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner' // Assume sonner/hot-toast is available

interface AddToCartButtonProps {
    product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = () => {
        addItem(product)
        toast.success(`${product.name} adicionado ao carrinho!`)
    }

    return (
        <button
            onClick={handleAddToCart}
            className="w-full mt-4 bg-brand-dark text-white py-2.5 rounded-lg font-medium hover:bg-stone-800 transition flex items-center justify-center gap-2"
        >
            <ShoppingCart size={18} />
            Adicionar ao Carrinho
        </button>
    )
}
