"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react'

// Define the type based on Prisma model + Base64 upload requirement
type Product = {
    id: string
    name: string
    description?: string
    price: number
    stock: number
    imageUrl?: string
}

export function ProdutosTab() {
    const [produtos, setProdutos] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: ''
    })
    const [isSaving, setIsSaving] = useState(false)

    const fetchProdutos = async () => {
        try {
            const res = await fetch('/api/admin/produtos')
            if (res.ok) {
                const data = await res.json()
                setProdutos(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProdutos()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    imageUrl: formData.imageUrl
                })
            })
            if (res.ok) {
                setIsModalOpen(false)
                setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' })
                fetchProdutos()
            } else {
                alert('Erro ao salvar produto')
            }
        } catch (error) {
            console.error(error)
            alert('Erro ao salvar produto')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 w-full text-left">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-stone-800">Gerenciar Produtos</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-gold text-white px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
                    style={{ backgroundColor: '#D4AF37' }} // brand-gold fallback
                >
                    <Plus size={18} /> Novo Produto
                </button>
            </div>

            {loading ? (
                <p className="text-stone-500">Carregando produtos...</p>
            ) : (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 text-stone-500 border-b border-stone-200">
                                <th className="p-4 font-medium">Imagem</th>
                                <th className="p-4 font-medium">Nome</th>
                                <th className="p-4 font-medium">Preço</th>
                                <th className="p-4 font-medium">Estoque</th>
                                <th className="p-4 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtos.map(p => (
                                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition duration-150">
                                    <td className="p-4">
                                        {p.imageUrl ? (
                                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-stone-200" />
                                        ) : (
                                            <div className="w-12 h-12 bg-stone-100 border border-stone-200 rounded-md flex items-center justify-center text-stone-400">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-stone-800">{p.name}</td>
                                    <td className="p-4 text-stone-600">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                                    </td>
                                    <td className="p-4 text-stone-600">{p.stock} uni.</td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-end">
                                            <button className="p-2 text-stone-400 hover:text-brand-dark hover:bg-stone-100 rounded-md transition"><Edit2 size={16} /></button>
                                            <button className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {produtos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-stone-500 bg-stone-50/30">
                                        <Package className="mx-auto mb-2 opacity-20" size={32} />
                                        Nenhum produto cadastrado na loja.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Desktop/Mobile */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h3 className="text-xl font-bold text-stone-800">Novo Produto</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 font-bold text-xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nome da Ração/Produto</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition" placeholder="Ex: Ração Golden 15kg" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Descrição</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition" rows={3} placeholder="Descrição detalhada do produto..."></textarea>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Preço Varejo (R$)</label>
                                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition" placeholder="0.00" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Estoque Inicial</label>
                                    <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition" placeholder="50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Imagem (Obrigatório FileReader Base64)</label>
                                <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-stone-200 shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center text-stone-400">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20 cursor-pointer transition" />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition">Cancelar</button>
                                <button disabled={isSaving} type="submit" className="px-5 py-2.5 bg-brand-dark text-white rounded-lg font-medium hover:bg-stone-800 hover:shadow-md disabled:opacity-50 transition flex items-center gap-2">
                                    {isSaving ? 'Salvando BD...' : 'Salvar Produto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
import { Package } from 'lucide-react'
