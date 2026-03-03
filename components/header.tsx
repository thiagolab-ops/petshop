'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Sparkles, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-primary/20"
    >
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            {process.env.NEXT_PUBLIC_LOGO_URL ? (
              <Image
                src={process.env.NEXT_PUBLIC_LOGO_URL}
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Sparkles className="w-8 h-8" />
            )}
            <span>{process.env.NEXT_PUBLIC_APP_NAME || 'Bela Estética'}</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 font-semibold transition-colors ${isActive('/')
                ? 'text-primary'
                : 'text-foreground hover:text-primary/80'
                }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Início</span>
            </Link>

            <Link
              href="/servicos"
              className={`flex items-center gap-2 font-semibold transition-colors ${isActive('/servicos')
                ? 'text-primary'
                : 'text-foreground hover:text-primary/80'
                }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline">Nossos Serviços</span>
            </Link>

            <Link
              href="/carrinho"
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all border-2 ${isActive('/carrinho')
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/50'
                : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white'
                }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Carrinho</span>
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  )
}
