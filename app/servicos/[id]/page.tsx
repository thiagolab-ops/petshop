import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = 'force-dynamic';

export default async function ServiceDetailsPage({ params }: { params: { id: string } }) {
    const service = await prisma.service.findUnique({
        where: { id: params.id }
    });

    if (!service) return notFound();

    return (
        <div className="min-h-screen bg-brand-nude text-brand-dark pb-20">
            {/* Imagem de Destaque no Topo */}
            <div className="relative w-full h-[50vh] bg-stone-100">
                {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">Sem imagem</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-nude via-transparent to-transparent"></div>

                {/* Botão Voltar */}
                <Link href="/servicos" className="absolute top-6 left-6 flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors">
                    <ArrowLeft className="w-6 h-6 text-brand-dark" />
                </Link>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4">
                        {service.name}
                    </h1>
                    <p className="text-2xl font-bold text-brand-gold mb-8">
                        R$ {Number(service.price).toFixed(2).replace('.', ',')}
                    </p>

                    <div className="prose max-w-none text-stone-600 leading-relaxed mb-10 whitespace-pre-wrap">
                        {service.description || "Agende uma avaliação personalizada com nossas especialistas para saber mais detalhes sobre este procedimento."}
                    </div>

                    <AddToCartButton
                        service={service}
                        label="Agendar Este Procedimento"
                        className="flex items-center justify-center w-full py-4 rounded-xl bg-brand-rose text-white text-lg font-bold hover:bg-brand-rose/90 shadow-md"
                    />
                </div>
            </div>
        </div>
    );
}
