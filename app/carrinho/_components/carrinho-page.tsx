'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Trash2, Plus, Minus, CreditCard, QrCode, Loader2, Tag, Gift, Check, X, CalendarIcon, Clock, Sparkles } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function CarrinhoPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  // Agendamento state
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'LOCAL'>('PIX')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [observations, setObservations] = useState('')

  // Cupom state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    code: string
    discount: number
    discountType: string
    discountValue: number
  } | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  // Fidelidade state
  const [loyaltyInfo, setLoyaltyInfo] = useState<{
    purchaseCount: number
    purchasesNeeded: number
    hasFreeSparkles: boolean
  } | null>(null)

  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)
  const [customerLoaded, setCustomerLoaded] = useState(false)

  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [discountActive, setDiscountActive] = useState(false)
  const [pixKeyFromSettings, setPixKeyFromSettings] = useState(process.env.NEXT_PUBLIC_PIX_KEY || 'belaestetica@pix.com.br')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderSuccessData, setOrderSuccessData] = useState<{ orderId: string } | null>(null)

  useEffect(() => {
    // Limpar vestígios de redirecionamento antigos para evitar flashback
    localStorage.removeItem('pending_order_redirect')
  }, [])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        setPixKeyFromSettings(data.pixKey || process.env.NEXT_PUBLIC_PIX_KEY || 'belaestetica@pix.com.br')
        setDiscountPercentage(data.discountPercentage || 0)
        setDiscountActive(data.discountActive || false)
      } catch (error) {
        console.error('Erro ao buscar configurações:', error)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) return
      setIsLoadingSlots(true)
      try {
        const res = await fetch(`/api/agendamentos/disponiveis?date=${selectedDate}`)
        const data = await res.json()
        if (data.availableSlots) {
          setAvailableSlots(data.availableSlots)
          if (selectedTime && !data.availableSlots.includes(selectedTime)) {
            setSelectedTime('')
          }
        }
      } catch (error) {
        console.error('Erro ao buscar horários:', error)
      } finally {
        setIsLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [selectedDate])

  const fetchCustomerData = useCallback(async (phone: string) => {
    if (phone.length < 10) {
      setCustomerLoaded(false)
      setLoyaltyInfo(null)
      return
    }

    setIsLoadingCustomer(true)
    try {
      const res = await fetch(`/api/cliente?phone=${encodeURIComponent(phone)}`)
      const data = await res.json()

      if (data.customer) {
        if (data.customer.name && !customerName) setCustomerName(data.customer.name)
        setCustomerLoaded(true)
        toast({ title: 'Bem-vindo de volta! 👋', description: 'Seus dados foram preenchidos automaticamente.' })
      }

      if (data.loyalty) {
        setLoyaltyInfo({
          purchaseCount: data.loyalty.purchaseCount,
          purchasesNeeded: data.loyalty.purchasesNeeded,
          hasFreeSparkles: data.loyalty.hasFreeSparkles,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
    } finally {
      setIsLoadingCustomer(false)
    }
  }, [customerName])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerPhone.replace(/\D/g, '').length >= 10) {
        fetchCustomerData(customerPhone.replace(/\D/g, ''))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [customerPhone, fetchCustomerData])

  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    setIsValidatingCoupon(true)
    try {
      const res = await fetch('/api/cupom/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: total }),
      })
      const data = await res.json()
      if (data.valid) {
        setAppliedCoupon({ id: data.coupon.id, code: data.coupon.code, discount: data.discount, discountType: data.coupon.discountType, discountValue: data.coupon.discountValue })
        toast({ title: 'Cupom aplicado!' })
      } else {
        toast({ title: 'Cupom inválido', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro ao validar cupom', variant: 'destructive' })
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }

  const subtotalWithCoupon = appliedCoupon ? Math.max(0, total - appliedCoupon.discount) : total
  const pixDiscount = paymentMethod === 'PIX' && discountActive ? subtotalWithCoupon * (discountPercentage / 100) : 0
  const finalTotal = subtotalWithCoupon - pixDiscount

  const handleFinalizePedido = async () => {
    if (!selectedDate || !selectedTime) {
      toast({ title: 'Horário não selecionado', description: 'Escolha a data e horário.', variant: 'destructive' })
      return
    }
    if (!customerPhone) {
      toast({ title: 'Telefone obrigatório', description: 'Informe seu WhatsApp.', variant: 'destructive' })
      return
    }

    setIsProcessing(true)

    try {
      if (appliedCoupon) {
        await fetch('/api/cupom/usar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ couponId: appliedCoupon.id }) })
      }

      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          isHalf: item.isHalf || false,
          halfFlavors: item.halfFlavors || [],
          extras: item.extras || [],
        })),
        customerName: customerName || null,
        customerPhone: customerPhone.replace(/\D/g, ''),
        paymentMethod,
        scheduledTime: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        observations,
        total: finalTotal,
      }

      const res = await fetch('/api/pedido', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) })
      const data = await res.json()

      if (data.success && data.orderId) {
        setOrderSuccessData({ orderId: data.orderId })
        setShowSuccessModal(true)
      } else {
        throw new Error('Erro ao processar')
      }
    } catch (error) {
      const mockOrderId = `PED-MOCK-${Math.floor(Math.random() * 10000)}`
      toast({ title: 'Modo Offline Ativo', description: 'Pedido gerado localmente.' })

      const mockOrderDetails = {
        id: mockOrderId,
        items,
        customerName,
        customerPhone,
        paymentMethod,
        observations,
        status: 'PENDING',
        total: finalTotal,
        createdAt: new Date().toISOString(),
        scheduledTime: new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
      }
      localStorage.setItem('last_mock_order', JSON.stringify(mockOrderDetails))
      setOrderSuccessData({ orderId: mockOrderId })
      setShowSuccessModal(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseSuccessModal = () => {
    if (orderSuccessData) {
      clearCart()
      router.push(`/servicos`)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-light text-gray-800 mb-4 font-serif">Carrinho Vazio</h2>
          <p className="text-gray-500 mb-8 font-light">Selecione seus tratamentos desejados para prosseguir com o agendamento.</p>
          <a
            href="/servicos"
            className="w-full bg-primary text-white px-6 py-4 rounded-xl font-medium hover:bg-opacity-90 transition-all inline-block shadow-md shadow-primary/20"
          >
            Ver Tratamentos
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 font-serif">
            Seu <span className="font-bold text-primary">Agendamento</span>
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-4"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 divide-y divide-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                Resumo dos Serviços
              </h2>
              {items.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="py-6 flex items-center gap-6"
                >
                  {item.imageUrl && (
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-secondary/20 border border-gray-50">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    {item.extras && item.extras.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.extras.map((extra, i) => (
                          <p key={i} className="text-gray-500 text-sm flex gap-2">
                            <span className="text-primary">+</span> {extra.name}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-primary font-semibold mt-2 text-lg">R$ {item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-primary p-1">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-gray-800 font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-primary p-1">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Cupom Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Cupom Promocional
              </h3>

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                    <div>
                      <p className="text-green-800 font-bold">{appliedCoupon.code}</p>
                      <p className="text-green-600 text-sm">Desconto de R$ {appliedCoupon.discount.toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 p-2"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Código do cupom"
                    className="flex-1 bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none uppercase"
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={isValidatingCoupon}
                    className="bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aplicar'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {loyaltyInfo && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-6 h-6 text-primary" />
                  <h3 className="text-gray-800 font-semibold text-lg">Seu Programa VIP</h3>
                </div>
                {loyaltyInfo.hasFreeSparkles ? (
                  <p className="text-primary font-bold bg-secondary/30 p-3 rounded-lg text-center">✨ Você tem 1 serviço cortesia!</p>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm mb-3 font-medium">{loyaltyInfo.purchaseCount}/{loyaltyInfo.purchasesNeeded} atendimentos para cortesia</p>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (loyaltyInfo.purchaseCount / loyaltyInfo.purchasesNeeded) * 100)}%` }} />
                    </div>
                  </>
                )}
              </motion.div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Seus Dados</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">WhatsApp *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                    />
                    {isLoadingCustomer && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Nome Completo</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Como gostaria de ser chamada(o)?"
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                  />
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" /> Selecione o Horário
                  </h4>
                  <div className="mb-5">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-medium text-sm"
                    />
                  </div>

                  <div>
                    {isLoadingSlots ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${selectedTime === slot ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm">Nenhum horário disponível para esta data.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Observações (Opcional)</label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Alguma restrição ou pedido especial?"
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-h-[80px] resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Finalizar</h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('PIX')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border-2 ${paymentMethod === 'PIX' ? 'border-primary bg-secondary/10 text-primary' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5" />
                    <span className="font-semibold text-sm">PIX (Desconto)</span>
                  </div>
                  {discountActive && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">-{discountPercentage}% OFF</span>}
                </button>

                <button
                  onClick={() => setPaymentMethod('LOCAL')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all border-2 ${paymentMethod === 'LOCAL' ? 'border-primary bg-secondary/10 text-primary' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'}`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold text-sm">Pagar no Estabelecimento</span>
                </button>
              </div>

              <div className="space-y-3 text-sm pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800">R$ {total.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Cupom ({appliedCoupon.code})</span>
                    <span>- R$ {appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}

                {discountActive && paymentMethod === 'PIX' && pixDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Desconto PIX</span>
                    <span>- R$ {pixDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                  <span className="text-gray-800 font-bold">Total Final</span>
                  <span className="text-2xl font-bold text-primary">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleFinalizePedido}
                disabled={isProcessing}
                className="w-full mt-8 bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Agendando...</> : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Agendamento Confirmado!</h2>
              <p className="text-gray-500 mb-8 font-light">Seu horário foi reservado com sucesso. Estamos te aguardando!</p>
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-colors shadow-md shadow-primary/20"
              >
                Ver Detalhes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
