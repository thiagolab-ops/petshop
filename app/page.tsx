import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ShoppingBag, Scissors } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  return (
    <main className="min-h-screen bg-brand-nude flex justify-center text-brand-dark font-sans selection:bg-brand-rose selection:text-white">
      <div className="w-full flex flex-col bg-brand-nude shadow-sm overflow-hidden min-h-screen">
        {/* HEADER LOGO */}
        <header className="absolute top-0 left-0 w-full z-50 p-6 flex justify-center">
          <h1 className="font-heading text-3xl font-bold tracking-widest text-brand-dark drop-shadow-sm">
            BELA <span className="text-brand-gold italic">Pet</span>
          </h1>
        </header>

        {/* HERO */}
        <div className="relative flex flex-col w-full min-h-screen justify-center pb-12 px-6 overflow-hidden">
          {/* BACKGROUND LAYER */}
          <div className="absolute inset-0 z-0 bg-brand-nude">
            {/* If there is a video, it could go here, for now a soft color overlay */}
          </div>
          <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px]"></div>

          {/* HERO CONTENT */}
          <div className="relative z-20 flex flex-col items-center text-center space-y-6 pt-20">
            <h2 className="font-heading text-5xl md:text-6xl font-light leading-tight text-brand-dark uppercase drop-shadow-sm">
              Cuidado Completo<br />
              <span className="text-brand-gold italic font-medium">&amp; Bem-Estar</span>
            </h2>
            <p className="text-sm md:text-base text-stone-600 max-w-md font-light">
              O espaço perfeito pensado para o conforto, saúde e realce da beleza natural do seu pet.
            </p>

            {/* AÇÕES PRINCIPAIS */}
            <div className="pt-12 w-full max-w-4xl px-4 grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Card Loja */}
              <Link href="/loja" className="group">
                <div className="flex flex-col items-center justify-center bg-white/70 border border-brand-rose/20 backdrop-blur-sm rounded-3xl p-10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full">
                  <div className="w-20 h-20 rounded-full bg-brand-rose/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-rose group-hover:text-white text-brand-rose transition-all duration-500">
                    <ShoppingBag size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading text-2xl tracking-widest uppercase mb-3 text-brand-dark">Pet Store</h3>
                  <p className="text-stone-500 text-sm font-light text-center">
                    Rações premium, acessórios exclusivos e brinquedos selecionados para a alegria da sua família.
                  </p>
                </div>
              </Link>

              {/* Card Serviços */}
              <Link href="/servicos" className="group">
                <div className="flex flex-col items-center justify-center bg-white/70 border border-brand-gold/20 backdrop-blur-sm rounded-3xl p-10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full">
                  <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-white text-brand-gold transition-all duration-500">
                    <Scissors size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading text-2xl tracking-widest uppercase mb-3 text-brand-dark">Pet Care</h3>
                  <p className="text-stone-500 text-sm font-light text-center">
                    Banho relaxante, tosa na tesoura e tratamentos estéticos com profissionais especializados.
                  </p>
                </div>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
