'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Sparkles, Package, Percent, Megaphone, Bell, ShoppingBag, LogOut, Settings, Folder, BarChart3 } from 'lucide-react'
import CardapioTab from './cardapio-tab'
import CombosTab from './combos-tab'
import DescontosTab from './descontos-tab'
import MarketingTab from './marketing-tab'
import ConfiguracoesTab from './configuracoes-tab'
import CategoriasTab from './categorias-tab'
import FinanceiroTab from './financeiro-tab'
import PedidosTab from './pedidos-tab'

type Tab = 'cardapio' | 'categorias' | 'combos' | 'descontos' | 'marketing' | 'pedidos' | 'configuracoes' | 'financeiro'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('cardapio')

  const tabs = [
    { id: 'cardapio', label: 'Serviços', icon: Sparkles },
    { id: 'categorias', label: 'Categorias', icon: Folder },
    { id: 'combos', label: 'Combos', icon: Package },
    { id: 'descontos', label: 'Descontos', icon: Percent },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'pedidos', label: 'Agendamentos', icon: ShoppingBag },
    { id: 'financeiro', label: 'Financeiro', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cardapio':
        return <CardapioTab />
      case 'categorias':
        return <CategoriasTab />
      case 'combos':
        return <CombosTab />
      case 'descontos':
        return <DescontosTab />
      case 'marketing':
        return <MarketingTab />
      case 'pedidos':
        return <PedidosTab />
      case 'financeiro':
        return <FinanceiroTab />
      case 'configuracoes':
        return <ConfiguracoesTab />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-primary/20 sticky top-0 z-50 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Bela Estética <span className="text-primary">Admin</span>
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-gray-800 rounded-xl border border-primary/30 p-4 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 font-semibold transition-all ${activeTab === tab.id
                      ? 'bg-primary text-black'
                      : 'text-white hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

