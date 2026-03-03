"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingCart,
  Package,
  Scissors,
  Users,
  LogOut,
  UploadCloud
} from 'lucide-react'
import { ProdutosTab } from './_components/produtos-tab'
import { ServicosTab } from './_components/servicos-tab'

// OBSERVAÇÃO IMPORTANTE (REGRA DE OURO):
// ----------------------------------------------------------------------------
// TODO upload de imagem usará ESTritamente FileReader e conversão para Base64
// injetada no state, SEM depender de uploaders externos.
// Exemplo de código:
// const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onloadend = () => setBase64Image(reader.result as string);
//     reader.readAsDataURL(file);
//   }
// };
// ----------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('Visão Geral')

  const menuItems = [
    { name: 'Visão Geral', icon: <LayoutDashboard size={20} /> },
    { name: 'Agenda (Banho/Tosa)', icon: <CalendarDays size={20} /> },
    { name: 'Pedidos (Loja)', icon: <ShoppingCart size={20} /> },
    { name: 'Produtos', icon: <Package size={20} /> },
    { name: 'Serviços', icon: <Scissors size={20} /> },
    { name: 'Clientes/Pets', icon: <Users size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans text-brand-dark">

      {/* SIDEBAR FIXA */}
      <aside className="w-64 bg-white border-r border-stone-200 fixed h-full flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b border-stone-100 flex items-center justify-center">
          <h1 className="font-heading text-xl font-bold tracking-widest text-brand-dark">
            ADMIN <span className="text-brand-gold italic">Pet</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium
                    ${activeTab === item.name
                      ? 'bg-brand-rose/10 text-brand-rose'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'}
                  `}
                >
                  {item.icon}
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-stone-100">
          <Link href="/">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
              <LogOut size={20} />
              Sair
            </button>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">{activeTab}</h2>
            <p className="text-sm text-stone-500 mt-1">Bem-vindo ao painel de controle da Bela Pet.</p>
          </div>

          {/* Avatar Area Placehoder */}
          <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold font-bold">
            A
          </div>
        </header>

        {/* Dashboard Content Mock */}
        {activeTab === 'Produtos' ? (
          <ProdutosTab />
        ) : activeTab === 'Serviços' ? (
          <ServicosTab />
        ) : (
          <section className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 text-stone-300">
              {menuItems.find(i => i.name === activeTab)?.icon || <LayoutDashboard size={32} />}
            </div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Módulo: {activeTab}</h3>
            <p className="text-stone-500 max-w-md">
              Esta é a tela inicial do módulo de {activeTab.toLowerCase()}.
              Funcionalidades específicas serão implementadas aqui.
            </p>

            {(activeTab === 'Clientes/Pets') && (
              <div className="mt-12 bg-blue-50/50 border border-blue-100 p-6 rounded-xl max-w-xl text-left">
                <div className="flex items-center gap-3 text-blue-600 font-semibold mb-3">
                  <UploadCloud size={20} />
                  Regra de Upload de Imagens
                </div>
                <p className="text-sm text-blue-800/80 leading-relaxed font-mono bg-blue-100/30 p-4 rounded-lg">
                  TODO upload neste CMS será via <strong className="font-bold">FileReader</strong> convertendo em
                  <strong className="font-bold"> Base64</strong> e gravado no BD em JSON ou String, sem Amazon S3 ou externos.
                </p>
              </div>
            )}
          </section>
        )}
      </main>

    </div>
  )
}
