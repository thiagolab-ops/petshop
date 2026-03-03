"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { toast } from "@/hooks/use-toast";

export default function AddToCartButton({ service, label = "Agendar Agora", className }: any) {
    const router = useRouter();
    const { addItem } = useCart();

    const handleBook = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addItem({
            id: service.id,
            name: service.name,
            price: service.price,
            quantity: 1,
            imageUrl: service.imageUrl,
        });

        toast({
            title: 'Serviço selecionado!',
            description: `${service.name} foi adicionado à sua lista.`,
            className: 'bg-white border-brand-rose text-brand-dark font-medium'
        });

        router.push("/carrinho");
    };

    return (
        <button onClick={handleBook} className={className}>
            {label}
        </button>
    );
}
