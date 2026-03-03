'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Ticket, Gift, Plus, Edit, Trash2, Check, X, Percent, Calendar, Clock, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Service {
  id: string
  name: string
  price: number
  category: string
}

interface Promotion {
  id: string
  name: string
  description: string
  serviceIds: string[]
  discountPercentage: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
  usageLimit: number
  usageCount: number
  validUntil: string | null
  isActive: boolean
}

interface Loyalty {
  id: string
  phone: string
  purchaseCount: number
  hasFreeSparkles: boolean
}

export default function MarketingTab() {
  const [activeSubTab, setActiveSubTab] = useState<'promocoes' | 'cupons' | 'fidelidade'>('promocoes')

  // Promoções state
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [showPromoForm, setShowPromoForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [promoForm, setPromoForm] = useState({
    name: '',
    description: '',
    serviceIds: [] as string[],
    discountPercentage: '',
    startDate: '',
    endDate: '',
  })

  // Cupons state
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    usageLimit: '',
    validUntil: '',
  })

  // Fidelidade state
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<Loyalty[]>([])
  const [purchasesNeeded, setPurchasesNeeded] = useState(10)
  const [newPurchasesNeeded, setNewPurchasesNeeded] = useState('')

  useEffect(() => {
    fetchServices()
    fetchPromotions()
    fetchCoupons()
    fetchLoyalty()
  }, [])

  const fetchServices = async () => {
    const res = await fetch('/api/admin/serviços')
    const data = await res.json()
    setServices(data.services || [])
  }

  const fetchPromotions = async () => {
    const res = await fetch('/api/admin/promocoes')
    const data = await res.json()
    setPromotions(data.promotions || [])
  }

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/cupons')
    const data = await res.json()
    setCoupons(data.coupons || [])
  }

  const fetchLoyalty = async () => {
    const res = await fetch('/api/admin/fidelidade')
    const data = await res.json()
    setLoyaltyCustomers(data.customers || [])
    setPurchasesNeeded(data.purchasesNeeded || 10)
    setNewPurchasesNeeded(String(data.purchasesNeeded || 10))
  }

  // === PROMOÃ‡Ã•ES ===
  const handlePromoSubmit = async () => {
    if (!promoForm.name || promoForm.serviceIds.length === 0 || !promoForm.discountPercentage || !promoForm.startDate || !promoForm.endDate) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const url = editingPromo ? `/api/admin/promocoes/${editingPromo.id}` : '/api/admin/promocoes'
    const method = editingPromo ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promoForm),
    })

    if (res.ok) {
      toast.success(editingPromo ? 'Promoção atualizada!' : 'Promoção criada!')
      setShowPromoForm(false)
      setEditingPromo(null)
      resetPromoForm()
      fetchPromotions()
    } else {
      toast.error('Erro ao salvar promoÃ§Ã£o')
    }
  }

  const resetPromoForm = () => {
    setPromoForm({
      name: '',
      description: '',
      serviceIds: [],
      discountPercentage: '',
      startDate: '',
      endDate: '',
    })
  }

  const editPromo = (promo: Promotion) => {
    setEditingPromo(promo)
    setPromoForm({
      name: promo.name,
      description: promo.description,
      serviceIds: promo.serviceIds,
      discountPercentage: String(promo.discountPercentage),
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate.split('T')[0],
    })
    setShowPromoForm(true)
  }

  const deletePromo = async (id: string) => {
    if (!confirm('Excluir esta promoÃ§Ã£o?')) return
    const res = await fetch(`/api/admin/promocoes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Promoção excluída!')
      fetchPromotions()
    }
  }

  const togglePromoActive = async (promo: Promotion) => {
    const res = await fetch(`/api/admin/promocoes/${promo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !promo.isActive }),
    })
    if (res.ok) {
      toast.success(promo.isActive ? 'Promoção desativada' : 'Promoção ativada')
      fetchPromotions()
    }
  }

  const toggleServiceSelection = (serviceId: string) => {
    setPromoForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }))
  }

  // === CUPONS ===
  const handleCouponSubmit = async () => {
    if (!couponForm.code || !couponForm.discountValue || !couponForm.usageLimit) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const url = editingCoupon ? `/api/admin/cupons/${editingCoupon.id}` : '/api/admin/cupons'
    const method = editingCoupon ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponForm),
    })

    if (res.ok) {
      toast.success(editingCoupon ? 'Cupom atualizado!' : 'Cupom criado!')
      setShowCouponForm(false)
      setEditingCoupon(null)
      resetCouponForm()
      fetchCoupons()
    } else {
      toast.error('Erro ao salvar cupom')
    }
  }

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      usageLimit: '',
      validUntil: '',
    })
  }

  const editCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      usageLimit: String(coupon.usageLimit),
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
    })
    setShowCouponForm(true)
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Excluir este cupom?')) return
    const res = await fetch(`/api/admin/cupons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Cupom excluído!')
      fetchCoupons()
    }
  }

  const toggleCouponActive = async (coupon: Coupon) => {
    const res = await fetch(`/api/admin/cupons/${coupon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    })
    if (res.ok) {
      toast.success(coupon.isActive ? 'Cupom desativado' : 'Cupom ativado')
      fetchCoupons()
    }
  }

  // === FIDELIDADE ===
  const redeemFreeSparkles = async (phone: string) => {
    if (!confirm('Confirmar resgate do serviÃ§o grátis?')) return

    const res = await fetch('/api/admin/fidelidade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: 'redeem' }),
    })

    if (res.ok) {
      toast.success('Sparkles grátis resgatada! Contador zerado.')
      fetchLoyalty()
    } else {
      toast.error('Erro ao resgatar')
    }
  }

  const updatePurchasesNeeded = async () => {
    const res = await fetch('/api/admin/fidelidade', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loyaltyPurchasesNeeded: newPurchasesNeeded }),
    })

    if (res.ok) {
      toast.success('Configuração atualizada!')
      setPurchasesNeeded(parseInt(newPurchasesNeeded))
    } else {
      toast.error('Erro ao atualizar')
    }
  }

  const isPromoActive = (promo: Promotion) => {
    const now = new Date()
    const start = new Date(promo.startDate)
    const end = new Date(promo.endDate)
    return promo.isActive && now >= start && now <= end
  }

  const subTabs = [
    { key: 'promocoes', label: 'Promoções', icon: Megaphone },
    { key: 'cupons', label: 'Cupons', icon: Ticket },
    { key: 'fidelidade', label: 'Fidelidade', icon: Gift },
  ]

  return (
    <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Megaphone className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-bold text-white">Marketing & Fidelidade</h2>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        {subTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${activeSubTab === tab.key
                ? 'bg-primary text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* === PROMOÃ‡Ã•ES === */}
      {activeSubTab === 'promocoes' && (
        <div>
          <button
            onClick={() => { resetPromoForm(); setEditingPromo(null); setShowPromoForm(true) }}
            className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 mb-6"
          >
            <Plus className="w-5 h-5" />
            Criar Promoção
          </button>

          {/* FormulÃ¡rio de Promoção */}
          <AnimatePresence>
            {showPromoForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-700 rounded-lg p-6 mb-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {editingPromo ? 'Editar Promoção' : 'Nova Promoção'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-300 text-sm">Nome da Promoção *</label>
                    <input
                      type="text"
                      value={promoForm.name}
                      onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                      placeholder="Ex: Sparkles Day"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Desconto (%) *</label>
                    <input
                      type="number"
                      value={promoForm.discountPercentage}
                      onChange={(e) => setPromoForm({ ...promoForm, discountPercentage: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                      placeholder="Ex: 20"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-300 text-sm">Data Início *</label>
                    <input
                      type="date"
                      value={promoForm.startDate}
                      onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Data Fim *</label>
                    <input
                      type="date"
                      value={promoForm.endDate}
                      onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-gray-300 text-sm">Descrição</label>
                  <textarea
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                    rows={2}
                    placeholder="Descrição opcional..."
                  />
                </div>

                <div className="mb-4">
                  <label className="text-gray-300 text-sm mb-2 block">Selecione os serviços em Promoção *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-gray-800 p-3 rounded-lg">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${promoForm.serviceIds.includes(service.id)
                          ? 'bg-primary/20 border border-primary'
                          : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={promoForm.serviceIds.includes(service.id)}
                          onChange={() => toggleServiceSelection(service.id)}
                          className="accent-primary"
                        />
                        <span className="text-white text-sm truncate">{service.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{promoForm.serviceIds.length} serviço(s) selecionado(s)</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePromoSubmit}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
                  >
                    <Check className="w-5 h-5" />
                    Salvar
                  </button>
                  <button
                    onClick={() => { setShowPromoForm(false); setEditingPromo(null) }}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-500"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de Promoções */}
          <div className="space-y-3">
            {promotions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma promoÃ§Ã£o cadastrada</p>
            ) : (
              promotions.map((promo) => (
                <div key={promo.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-lg">{promo.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPromoActive(promo) ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                          }`}>
                          {isPromoActive(promo) ? 'ATIVA' : 'INATIVA'}
                        </span>
                      </div>
                      <p className="text-primary font-bold text-xl">{promo.discountPercentage}% OFF</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(promo.startDate).toLocaleDateString('pt-BR')} - {new Date(promo.endDate).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-gray-400 text-sm">{promo.serviceIds.length} serviço(s)</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePromoActive(promo)}
                        className={`p-2 rounded-lg ${promo.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                      >
                        {promo.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                      <button onClick={() => editPromo(promo)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => deletePromo(promo.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* === CUPONS === */}
      {activeSubTab === 'cupons' && (
        <div>
          <button
            onClick={() => { resetCouponForm(); setEditingCoupon(null); setShowCouponForm(true) }}
            className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 mb-6"
          >
            <Plus className="w-5 h-5" />
            Criar Cupom
          </button>

          {/* FormulÃ¡rio de Cupom */}
          <AnimatePresence>
            {showCouponForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-700 rounded-lg p-6 mb-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-300 text-sm">Código do Cupom *</label>
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none uppercase"
                      placeholder="Ex: DESCONTO20"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Tipo de Desconto *</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-gray-300 text-sm">
                      Valor do Desconto {couponForm.discountType === 'percentage' ? '(%)' : '(R$)'} *
                    </label>
                    <input
                      type="number"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                      placeholder={couponForm.discountType === 'percentage' ? 'Ex: 20' : 'Ex: 15.00'}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Limite de Uso *</label>
                    <input
                      type="number"
                      value={couponForm.usageLimit}
                      onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                      placeholder="Ex: 100"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Válido até</label>
                    <input
                      type="date"
                      value={couponForm.validUntil}
                      onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCouponSubmit}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
                  >
                    <Check className="w-5 h-5" />
                    Salvar
                  </button>
                  <button
                    onClick={() => { setShowCouponForm(false); setEditingCoupon(null) }}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-500"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de Cupons */}
          <div className="space-y-3">
            {coupons.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum cupom cadastrado</p>
            ) : (
              coupons.map((coupon) => {
                const isExpired = coupon.validUntil && new Date() > new Date(coupon.validUntil)
                const isExhausted = coupon.usageCount >= coupon.usageLimit
                const isValid = coupon.isActive && !isExpired && !isExhausted

                return (
                  <div key={coupon.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-primary font-bold text-xl bg-gray-800 px-3 py-1 rounded">
                            {coupon.code}
                          </code>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isValid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {isValid ? 'VÃLIDO' : isExpired ? 'EXPIRADO' : isExhausted ? 'ESGOTADO' : 'INATIVO'}
                          </span>
                        </div>
                        <p className="text-white font-semibold mt-2">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Uso: {coupon.usageCount}/{coupon.usageLimit}
                          {coupon.validUntil && ` â€¢ Válido até: ${new Date(coupon.validUntil).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleCouponActive(coupon)}
                          className={`px-3 py-1 rounded-lg text-sm ${coupon.isActive ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                        >
                          {coupon.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onClick={() => editCoupon(coupon)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteCoupon(coupon.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* === FIDELIDADE === */}
      {activeSubTab === 'fidelidade' && (
        <div>
          {/* Configuração */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Configuração do Programa de Fidelidade
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              A cada X compras confirmadas, o cliente ganha 1 serviÃ§o grátis.
              <br />
              <span className="text-primary/80">O contador Ã© atualizado automaticamente quando vocÃª confirma um pedido.</span>
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={newPurchasesNeeded}
                onChange={(e) => setNewPurchasesNeeded(e.target.value)}
                className="w-24 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 text-center font-bold text-xl"
                min="1"
              />
              <span className="text-white">compras para ganhar 1 grátis</span>
              {parseInt(newPurchasesNeeded) !== purchasesNeeded && (
                <button
                  onClick={updatePurchasesNeeded}
                  className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90"
                >
                  Salvar
                </button>
              )}
            </div>
          </div>

          {/* Lista de Clientes */}
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Clientes Fidelidade ({loyaltyCustomers.length})
          </h3>

          <div className="space-y-3">
            {loyaltyCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum cliente cadastrado ainda</p>
            ) : (
              loyaltyCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`rounded-lg p-4 ${customer.hasFreeSparkles
                    ? 'bg-gradient-to-r from-green-500/20 to-yellow-500/20 border-2 border-green-500'
                    : 'bg-gray-700'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold text-lg">{customer.phone}</p>
                      <p className={`font-semibold ${customer.hasFreeSparkles ? 'text-green-400' : 'text-gray-400'
                        }`}>
                        {customer.hasFreeSparkles ? (
                          <span className="flex items-center gap-2">
                            <Gift className="w-5 h-5" />
                            ðŸŽ‰ Sparkles Grátis Disponível!
                          </span>
                        ) : (
                          `${customer.purchaseCount}/${purchasesNeeded} compras`
                        )}
                      </p>
                      {!customer.hasFreeSparkles && (
                        <div className="w-48 bg-gray-600 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (customer.purchaseCount / purchasesNeeded) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {customer.hasFreeSparkles && (
                      <button
                        onClick={() => redeemFreeSparkles(customer.phone)}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 animate-pulse"
                      >
                        <Gift className="w-5 h-5" />
                        Resgatar Grátis
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

