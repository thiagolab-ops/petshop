'use client'

import { useState, useEffect } from 'react'
import { Percent } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function DescontosTab() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    discountPercentage: '',
    discountActive: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      setSettings(data.settings)
      setForm({
        discountPercentage: data.settings?.discountPercentage?.toString() || '0',
        discountActive: data.settings?.discountActive || false,
      })
    } catch (error) {
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success('Desconto atualizado!')
        fetchSettings()
      }
    } catch (error) {
      toast.error('Erro ao salvar desconto')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !settings) {
    return <div className="text-white text-center py-12">Carregando...</div>
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Percent className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-bold text-white">Desconto Global</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div>
          <label className="text-gray-300 mb-2 block">Porcentagem de Desconto (%):</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.discountPercentage}
            onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg text-2xl font-bold"
          />
        </div>

        <label className="flex items-center gap-3 text-white cursor-pointer bg-gray-700 p-4 rounded-lg">
          <input
            type="checkbox"
            checked={form.discountActive}
            onChange={(e) => setForm({ ...form, discountActive: e.target.checked })}
            className="w-6 h-6"
          />
          <span className="text-lg font-semibold">
            {form.discountActive ? 'Desconto Ativo' : 'Desconto Inativo'}
          </span>
        </label>

        {form.discountActive && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 font-bold text-lg">
              ✅ Desconto de {form.discountPercentage}% ativo em todos os serviços!
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black px-6 py-3 rounded-lg text-lg font-bold hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}

