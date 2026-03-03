'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Loader2, Upload, ImageIcon, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  order: number
  isActive: boolean
}

export default function CardapioTab() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    categoryId: '',
    tags: [] as string[],
    isAvailable: true,
    extras: [] as { name: string; price: string }[],
  })

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categorias')
      const data = await res.json()
      setCategories(data.categories || [])
      // Se tiver categorias e o form nÃ£o tem categoria selecionada, selecionar a primeira
      if (data.categories?.length > 0 && !form.category) {
        setForm(prev => ({
          ...prev,
          category: data.categories[0].name,
          categoryId: data.categories[0].id
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/produtos')
      if (!res.ok) throw new Error('Falha ao obter dados da API')
      const data = await res.json()
      setServices(data.services || [])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar serviços. Verifique se o banco está sincronizado.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExtra = () => {
    setForm(prev => ({
      ...prev,
      extras: [...prev.extras, { name: '', price: '' }]
    }))
  }

  const handleRemoveExtra = (index: number) => {
    setForm(prev => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index)
    }))
  }

  const handleExtraChange = (index: number, field: 'name' | 'price', value: string) => {
    const newExtras = [...form.extras]
    newExtras[index] = { ...newExtras[index], [field]: value }
    setForm(prev => ({ ...prev, extras: newExtras }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editing ? `/api/admin/produtos/${editing.id}` : '/api/admin/produtos'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(editing ? 'Serviço atualizado!' : 'Serviço criado!')
        resetForm()
        fetchServices()
      } else {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro desconhecido ao salvar')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(`Falha: ${error.message || 'Verifique sua conexão ou banco'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusão?')) return

    try {
      const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Não foi possível excluir')
      toast.success('Serviço excluído!')
      fetchServices()
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  const handleEdit = (service: any) => {
    setEditing(service)
    setForm({
      name: service.name,
      price: service.price.toString(),
      description: service.description,
      imageUrl: service.imageUrl,
      category: service.category,
      categoryId: service.categoryId || '',
      tags: service.tags || [],
      isAvailable: service.isAvailable,
      extras: service.extras ? service.extras.map((e: any) => ({ name: e.name, price: e.price.toString() })) : [],
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null)
    const firstCategory = categories.length > 0 ? categories[0] : null
    setForm({
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      category: firstCategory?.name || '',
      categoryId: firstCategory?.id || '',
      tags: [],
      isAvailable: true,
      extras: [],
    })
    setShowForm(false)
    setShowForm(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setForm((prev: any) => ({ ...prev, imageUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  if (loading && services.length === 0) {
    return <div className="text-white text-center py-12">Carregando...</div>
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Gerenciar Serviços</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Adicionar serviço
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-700 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing ? 'Editar serviço' : 'Novo serviço'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Preço *"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            />
          </div>

          <textarea
            placeholder="Descrição *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          />

          {/* Seção de Imagem Nativa Base64 */}
          <div className="flex flex-col gap-3 my-4 border p-4 rounded-lg bg-gray-800 border-gray-600">
            <label className="text-sm font-semibold text-gray-300">Imagem do Procedimento</label>

            {/* Preview Visual da Imagem */}
            {form.imageUrl && (
              <div className="w-32 h-32 relative rounded-md overflow-hidden border border-gray-600 shadow-sm bg-stone-50">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-black
                hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-gray-300 mb-2 block">Categoria *</label>
            <select
              value={form.categoryId}
              onChange={(e) => {
                const selectedCat = categories.find(c => c.id === e.target.value)
                setForm({
                  ...form,
                  categoryId: e.target.value,
                  category: selectedCat?.name || ''
                })
              }}
              required
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              <option value="">Selecione uma categoria</option>
              {categories.filter(c => c.isActive).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-yellow-400 text-sm mt-1">
                Nenhuma categoria cadastrada. Crie categorias na aba "Categorias".
              </p>
            )}
          </div>

          {/* Tags foram removidas da tabela de serviços (Bela Estética) */}

          {/* Seção de Adicionais (Extras) */}
          <div className="border-t border-gray-600 pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-300 font-semibold">Adicionais (Opcional)</label>
              <button
                type="button"
                onClick={handleAddExtra}
                className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Adicionar Extra
              </button>
            </div>

            <div className="space-y-3">
              {form.extras.map((extra, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Nome do adicional (ex: Borda Recheada)"
                    value={extra.name}
                    onChange={(e) => handleExtraChange(index, 'name', e.target.value)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={extra.price}
                    onChange={(e) => handleExtraChange(index, 'price', e.target.value)}
                    className="w-24 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExtra(index)}
                    className="p-2 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.extras.length === 0 && (
                <p className="text-gray-500 text-xs italic">Nenhum adicional configurado.</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="w-4 h-4"
            />
            Disponível
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
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
        {services.length === 0 && !loading && (
          <div className="bg-gray-700/40 rounded-xl p-8 text-center flex flex-col items-center justify-center border border-dashed border-gray-600">
            <h3 className="text-gray-300 font-bold mb-1">Nenhum serviço cadastrado</h3>
            <p className="text-gray-500 text-sm">Clique em "Adicionar serviço" para começar a preencher o seu catálogo.</p>
          </div>
        )}

        {services.map((service) => (
          <div
            key={service.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center gap-4"
          >
            {service.imageUrl && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-600">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <h4 className="text-lg font-bold text-white">{service.name}</h4>
              <p className="text-primary font-semibold">R$ {service.price.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">{service.category}</p>
              {!service.isAvailable && (
                <span className="text-red-500 text-sm font-semibold">Indisponível</span>
              )}
              {service.extras && Array.isArray(service.extras) && service.extras.length > 0 && (
                <p className="text-gray-400 text-xs mt-1">
                  +{service.extras.length} adicionais
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(service)}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
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

