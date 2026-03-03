'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, CheckCircle, Scissors, Truck, Package, Clock, X, CheckCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const ESTIMATED_TIMES = [
  '20-30 min',
  '30-45 min',
  '45-60 min',
  '60-90 min',
  '90+ min',
]

import { mockAdminOrders } from '@/lib/admin-mock-data'

export default function PedidosTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todos')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Modal de confirmação com tempo estimado
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedTime, setSelectedTime] = useState('30-45 min')

  useEffect(() => {
    fetchAppointments()
    const interval = setInterval(fetchAppointments, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/admin/pedidos')
      if (!res.ok) throw new Error('Falha na API')

      const data = await res.json()

      const remoteAppointments = data.appointments || []
      mergeWithLocalStatus(remoteAppointments)

    } catch (error) {
      console.error('Erro ao carregar agendamentos (usando mock):', error)
      // Fallback para dados mockados em caso de erro (ex: sem banco)
      mergeWithLocalStatus(mockAdminOrders)
    } finally {
      setLoading(false)
    }
  }

  // FunÃ§Ã£o para mesclar agendamentos (API ou Mock) com status salvos localmente
  const mergeWithLocalStatus = (baseOrders: any[]) => {
    const updatedOrders = baseOrders.map((order: any) => {
      const localStatus = localStorage.getItem(`order_status_${order.id}`)
      return localStatus ? { ...order, status: localStatus } : order
    })

    // Filtro para garantir que a ordem seja consistente (mais recentes primeiro)
    updatedOrders.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setOrders(updatedOrders)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, estimatedTime?: string) => {
    // 1. Tenta atualizar na API
    try {
      const body: any = { status: newStatus }
      if (estimatedTime) {
        body.estimatedTime = estimatedTime
      }

      await fetch(`/api/admin/pedidos/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      // NÃ£o importa se deu erro 500 ou 404 na API, vamos salvar localmente para a demo funcionar
    } catch (error) {
      console.log('API offline, ignorando erro...')
    }

    // 2. Salva no localStorage para simular persistÃªncia e sincronia com cliente
    localStorage.setItem(`order_status_${orderId}`, newStatus)

    toast.success(`Status atualizado para: ${newStatus} (Simulado)`)

    // 3. Atualiza a lista localmente imediatamente
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, estimatedTime: estimatedTime || o.estimatedTime } : o))
  }

  // Abrir modal para confirmar pedido com tempo estimado
  const openConfirmModal = (order: any) => {
    setSelectedOrder(order)
    setSelectedTime('30-45 min')
    setShowConfirmModal(true)
  }

  // Confirmar pedido com tempo estimado
  const handleConfirmOrder = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, 'Confirmado', selectedTime)
      setShowConfirmModal(false)
      setSelectedOrder(null)
    }
  }

  // Função Wrapper Conforme Pedido
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus)
    toast.success('Agendamento confirmado com sucesso!')
  }

  // Ações rÃ¡pidas por status
  const getQuickActions = (order: any) => {
    const actions = []

    switch (order.status) {
      case 'PENDING':
        actions.push({
          label: 'Confirmar Agendamento',
          icon: CheckCircle,
          color: 'bg-green-500 hover:bg-green-600',
          onClick: () => handleUpdateStatus(order.id, 'CONFIRMED'),
        })
        break
      default:
        break
    }

    return actions
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Confirmado': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Permitindo que o filtro mostre ambos padrões de base antiga e nova
  const statuses = ['Todos', 'PENDING', 'CONFIRMED']

  const filteredOrders = filter === 'Todos'
    ? orders
    : orders.filter(o => o.status === filter || (filter === 'PENDING' && o.status === 'Pendente') || (filter === 'CONFIRMED' && o.status === 'Confirmado'))

  if (loading) {
    return <div className="text-white text-center py-12">Carregando...</div>
  }

  return (
    <>
      <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-white">Gerenciar Agendamentos</h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Calendário
            </button>
          </div>
        </div>

        {/* RENDERIZAÇÃO CONDICIONAL CENTRAL */}
        {viewMode === 'list' ? (
          <div className="flex flex-col">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                    ? 'bg-primary text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                >
                  {status}
                  {status !== 'Todos' && (
                    <span className="ml-2 bg-gray-900/20 px-2 py-0.5 rounded-full text-xs">
                      {orders.filter(o => o.status === status || (status === 'PENDING' && o.status === 'Pendente') || (status === 'CONFIRMED' && o.status === 'Confirmado')).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum pedido encontrado</p>
              ) : (
                filteredOrders.map((order) => {
                  const quickActions = getQuickActions(order)

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-bold text-lg">Agendamento #{order.id.slice(0, 8)}</h4>
                          <p className="text-gray-400 text-sm">
                            Cadastrado em: {new Date(order.createdAt).toLocaleString('pt-BR')}
                          </p>
                          {order.scheduledTime && (
                            <div className="mt-2 bg-primary/10 border border-primary/20 rounded-lg p-2 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-primary" />
                              <p className="text-primary font-bold">
                                Horário Agendado: {new Date(order.scheduledTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <p className="text-primary font-bold text-xl mt-2">
                            R$ {order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-gray-300 font-semibold mb-2">Serviços:</h5>
                        <ul className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <li key={idx} className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-gray-300 flex justify-between items-center">
                              <span>
                                {item.quantity}x <span className="text-primary font-semibold">{item.name}</span>
                              </span>
                              <span className="text-gray-400">R$ {item.price.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4 border-t border-gray-600 pt-4">
                        <h5 className="text-gray-300 font-semibold mb-1">Dados do Cliente:</h5>
                        <div className="flex flex-col gap-1">
                          {order.customerName ? (
                            <p className="text-white font-medium flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              {order.customerName}
                            </p>
                          ) : (
                            <p className="text-gray-400 italic">Cliente não identificado</p>
                          )}
                          <p className="text-gray-400 text-sm">
                            Telefone: <span className="text-primary">{order.customerPhone}</span>
                          </p>
                          {order.address?.rua && (
                            <p className="text-gray-500 text-xs mt-2 italic">
                              (Endereço legado detectado: {order.address.rua}, {order.address.numero})
                            </p>
                          )}
                        </div>
                      </div>

                      {order.observations && (
                        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                          <h5 className="text-yellow-500 font-semibold mb-1 flex items-center gap-2">
                            ⚠️ Observações:
                          </h5>
                          <p className="text-gray-300 text-sm italic">"{order.observations}"</p>
                        </div>
                      )}

                      <div className="mb-4">
                        <h5 className="text-gray-300 font-semibold mb-1">Pagamento:</h5>
                        <p className="text-gray-400 text-sm">{order.paymentMethod}</p>
                      </div>

                      {(order.status === 'PENDING' || order.status === 'Pendente') && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                          <Button
                            onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                            className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            CONFIRMAR AGENDAMENTO
                          </Button>
                        </div>
                      )}

                      {quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-600">
                          {quickActions.map((action, idx) => {
                            const Icon = action.icon
                            return (
                              <button
                                key={idx}
                                onClick={action.onClick}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all ${action.color}`}
                              >
                                <Icon className="w-5 h-5" />
                                {action.label}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {order.status === 'Entregue' && (
                        <div className="pt-4 border-t border-gray-600">
                          <p className="text-green-400 font-semibold flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Pedido entregue com sucesso!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() - 1)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-600 rounded text-white"
              >
                &larr; Anterior
              </button>
              <h3 className="text-xl font-bold text-primary">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h3>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() + 1)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-600 rounded text-white"
              >
                Próximo &rarr;
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
              {Array.from({ length: 11 }, (_, i) => i + 8).map(hour => {
                const hourOrders = orders.filter(o => {
                  if (!o.scheduledTime) return false
                  const date = new Date(o.scheduledTime)
                  return date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear() &&
                    date.getHours() === hour
                })

                return (
                  <div key={hour} className="flex border-b border-gray-800 min-h-[80px]">
                    <div className="w-20 lg:w-32 bg-gray-800/50 p-4 flex items-start justify-center text-gray-400 font-bold border-r border-gray-800 shrink-0">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {hourOrders.length === 0 ? (
                        <div className="text-gray-600 text-sm italic flex items-center p-2 opacity-50">Livre</div>
                      ) : (
                        hourOrders.map(order => (
                          <div
                            key={order.id}
                            onClick={() => {
                              if (confirm(`Deseja confirmar ou gerenciar a Cita de ${order.customerName || 'Cliente'} às ${new Date(order.scheduledTime).toLocaleTimeString('pt-BR')}?`)) {
                                if (order.status === 'PENDING' || order.status === 'Pendente') {
                                  openConfirmModal(order)
                                } else {
                                  alert(`Agendamento de ${order.customerName} já está ${order.status}.`)
                                }
                              }
                            }}
                            className={`p-3 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity ${order.status === 'CONFIRMED' || order.status === 'Confirmado'
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-primary/10 border-primary/30'
                              }`}
                          >
                            <p className="font-bold text-white text-sm truncate flex items-center gap-2">
                              {order.status === 'CONFIRMED' || order.status === 'Confirmado' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                              {order.customerName || 'Cliente Anônimo'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1 truncate">
                              {order.items.map((i: any) => i.name).join(', ')}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-primary font-semibold text-xs text-right">R$ {order.total.toFixed(2)}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal de ConfirmaÃ§Ã£o com Tempo Estimado */}
        <AnimatePresence>
          {showConfirmModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-primary/50"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Confirmar Pedido</h3>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 mb-2">
                    Agendamento <span className="text-primary font-bold">#{selectedOrder.id.slice(0, 8)}</span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Total: <span className="text-white font-semibold">R$ {selectedOrder.total.toFixed(2)}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

