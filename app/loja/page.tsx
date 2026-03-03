import { prisma } from '@/lib/db'
import { StoreHeader } from '@/components/StoreHeader'
import { AddToCartButton } from '@/components/AddToCartButton'
import { Package } from 'lucide-react'

export const revalidate = 0 // Disable cache for this page so new products show instantly

export default async function LojaPage() {
    const produtos = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-brand-dark flex flex-col">
            <StoreHeader />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Nossos Produtos</h2>
                    <p className="text-stone-500 max-w-2xl mx-auto">
                        Selecione as melhores rações e acessórios para o seu pet com conforto e qualidade.
                    </p>
                </div>

                {produtos.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-100 flex flex-col items-center justify-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 text-stone-300">
                            <Package size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-stone-800 mb-2">Loja Vazia</h3>
                        <p className="text-stone-500">Nenhum produto foi cadastrado ainda. Volte mais tarde!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {produtos.map((produto) => (
                            <div key={produto.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col">
                                <div className="aspect-square w-full bg-stone-50 relative overflow-hidden flex items-center justify-center border-b border-stone-50 group">
                                    {produto.imageUrl ? (
                                        <img
                                            src={produto.imageUrl}
                                            alt={produto.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <Package className="text-stone-300 w-16 h-16" />
                                    )}
                                    {produto.stock <= 5 && produto.stock > 0 && (
                                        <span className="absolute top-4 left-4 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                                            Últimas {produto.stock} unid.
                                        </span>
                                    )}
                                    {produto.stock === 0 && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                                            <span className="bg-stone-800 text-white font-bold px-4 py-2 rounded-full transform -rotate-12">ESGOTADO</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-4 flex-1">
                                        <h3 className="text-lg font-bold text-stone-800 line-clamp-2 leading-snug">{produto.name}</h3>
                                        {produto.description && (
                                            <p className="text-sm text-stone-500 mt-2 line-clamp-2">{produto.description}</p>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="text-2xl font-black text-brand-dark tracking-tight mb-2">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
                                        </div>

                                        <AddToCartButton product={produto} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
