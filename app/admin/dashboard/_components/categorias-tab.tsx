'use client'

import { useState, useEffect } from 'react'
import { Folder, Plus, Edit2, Trash2, Save, X, Loader2, AlertTriangle, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  order: number
  isActive: boolean
  _count?: { services: number }
}

export default function CategoriasTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; servicesCount: number } | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categorias')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Digite o nome da categoria')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Categoria criada com sucesso!')
        setNewCategoryName('')
        fetchCategories()
      } else {
        toast.error(data.error || 'Erro ao criar categoria')
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      toast.error('Erro ao criar categoria')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) {
      toast.error('Digite o nome da categoria')
      return
    }

    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Categoria atualizada!')
        setEditingId(null)
        fetchCategories()
      } else {
        toast.error(data.error || 'Erro ao atualizar')
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      toast.error('Erro ao atualizar categoria')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        if (data.servicesUpdated > 0) {
          toast.success(`Categoria excluÃ­da! ${data.servicesUpdated} serviço(s) foram desvinculados.`)
        } else {
          toast.success('Categoria excluÃ­da!')
        }
        setDeleteConfirm(null)
        fetchCategories()
      } else {
        toast.error(data.error || 'Erro ao excluir')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast.error('Erro ao excluir categoria')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        toast.success(currentStatus ? 'Categoria desativada' : 'Categoria ativada')
        fetchCategories()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/20 p-3 rounded-lg">
            <Folder className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gerenciar Categorias</h2>
            <p className="text-gray-400 text-sm">Adicione, edite ou remova categorias do serviços</p>
          </div>
        </div>

        {/* Criar nova categoria */}
        <div className="bg-gray-700/50 rounded-lg p-4 border border-primary/20">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Criar Nova Categoria
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Manicure, Tratamentos Faciais, Massagens..."
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={isCreating || !newCategoryName.trim()}
              className="bg-primary text-black px-6 py-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Criar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Categorias Cadastradas</h3>

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma categoria cadastrada</p>
            <p className="text-gray-500 text-sm">Crie sua primeira categoria acima</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`bg-gray-700/50 rounded-lg p-4 border transition-all ${category.isActive ? 'border-primary/30' : 'border-gray-600 opacity-60'
                  }`}
              >
                {editingId === category.id ? (
                  // Modo ediÃ§Ã£o
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-primary focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(category.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <button
                      onClick={() => handleUpdate(category.id)}
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  // Modo visualizaÃ§Ã£o
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-white font-semibold text-lg">{category.name}</span>
                        <span className="ml-3 text-gray-400 text-sm">
                          {category._count?.services || 0} serviço(s)
                        </span>
                        {!category.isActive && (
                          <span className="ml-2 bg-gray-600 text-gray-300 px-2 py-0.5 rounded text-xs">
                            Inativa
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Toggle Ativo */}
                      <button
                        onClick={() => toggleActive(category.id, category.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category.isActive
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                          }`}
                      >
                        {category.isActive ? 'Ativa' : 'Inativa'}
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => {
                          setEditingId(category.id)
                          setEditName(category.name)
                        }}
                        className="bg-blue-500/20 text-blue-400 p-2 rounded-lg hover:bg-blue-500/30"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Excluir */}
                      <button
                        onClick={() => setDeleteConfirm({
                          id: category.id,
                          name: category.name,
                          servicesCount: category._count?.services || 0
                        })}
                        className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmaÃ§Ã£o de exclusÃ£o */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-red-500/50 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Confirmar ExclusÃ£o</h3>
            </div>

            <p className="text-gray-300 mb-2">
              Tem certeza que deseja excluir a categoria <strong className="text-primary">"{deleteConfirm.name}"</strong>?
            </p>

            {deleteConfirm.servicesCount > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm">
                  âš ï¸ Esta categoria possui <strong>{deleteConfirm.servicesCount} serviço(s)</strong> vinculados.
                  Os serviços nÃ£o serÃ£o excluÃ­dos, apenas desvinculados da categoria.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

