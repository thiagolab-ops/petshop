'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CombosTab() {
  const [combos, setCombos] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    serviceIds: [] as string[],
    imageUrl: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [combosRes, servicesRes] = await Promise.all([
        fetch('/api/admin/combos'),
        fetch('/api/admin/serviços'),
      ])
      const combosData = await combosRes.json()
      const servicesData = await servicesRes.json()
      setCombos(combosData.combos || [])
      setServices(servicesData.services || [])
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editing ? `/api/admin/combos/${editing.id}` : '/api/admin/combos'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(editing ? 'Combo atualizado!' : 'Combo criado!')
        resetForm()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar combo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusÃ£o?')) return

    try {
      await fetch(`/api/admin/combos/${id}`, { method: 'DELETE' })
      toast.success('Combo excluÃ­do!')
      fetchData()
    } catch (error) {
      toast.error('Erro ao excluir')
    }
  }

  const handleEdit = (combo: any) => {
    setEditing(combo)
    setForm({
      name: combo.name,
      price: combo.price.toString(),
      description: combo.description,
      serviceIds: combo.serviceIds,
      imageUrl: combo.imageUrl || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null)
    setForm({
      name: '',
      price: '',
      description: '',
      serviceIds: [],
      imageUrl: '',
    })
    setShowForm(false)
  }

  const toggleService = (serviceId: string) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }))
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Gerenciar Combos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Criar Combo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-700 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing ? 'Editar Combo' : 'Novo Combo'}
          </h3>

          <input
            type="text"
            placeholder="Nome do Combo *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            placeholder="PreÃ§o *"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          />

          <textarea
            placeholder="DescriÃ§Ã£o *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          />

          <input
            type="url"
            placeholder="URL da Imagem"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          />

          <div>
            <label className="text-gray-300 mb-2 block">serviços incluÃ­dos:</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {services.map(service => (
                <label key={service.id} className="flex items-center gap-2 text-white p-2 bg-gray-600 rounded">
                  <input
                    type="checkbox"
                    checked={form.serviceIds.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="w-4 h-4"
                  />
                  {service.name} - R$ {service.price.toFixed(2)}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {combos.map((combo) => (
          <div
            key={combo.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="text-lg font-bold text-white">{combo.name}</h4>
              <p className="text-primary font-semibold">R$ {combo.price.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">{combo.description}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(combo)}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(combo.id)}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

