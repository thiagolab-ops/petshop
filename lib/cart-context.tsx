'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  isHalf?: boolean
  halfFlavors?: string[]
  extras?: { name: string; price: number }[]
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('belaestetica_cart')
      try {
        return saved ? JSON.parse(saved) : []
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e)
        return []
      }
    }
    return []
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('belaestetica_cart', JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id && i.isHalf === item.isHalf)
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id && i.isHalf === item.isHalf
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
