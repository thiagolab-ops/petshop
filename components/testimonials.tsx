export default function Testimonials() {
    const testimonials = [
        { name: "Mariana Silva", rating: 5, text: "Minha pele nunca esteve tão radiante. O atendimento é impecável e o ambiente muito relaxante." },
        { name: "Juliana Costa", rating: 5, text: "Fiz limpeza de pele e drenagem, resultado incrível. Equipe muito capacitada, recomendo!" },
        { name: "Fernanda Lima", rating: 5, text: "Melhor clínica da região! Além de profissionais maravilhosos, a facilidade de agendar online é perfeita." },
    ]

    return (
        <section className="py-16 px-6 bg-stone-50 dark:bg-stone-950/50 w-full overflow-hidden">
            <h2 className="text-3xl font-medium text-center text-text-charcoal dark:text-white mb-10">
                O que nossas <span className="italic text-primary">clientes</span> dizem
            </h2>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
                {testimonials.map((t, idx) => (
                    <div key={idx} className="flex-1 bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-card border border-transparent dark:border-stone-800">
                        <div className="flex gap-1 mb-4">
                            {[...Array(t.rating)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            ))}
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 italic mb-6">"{t.text}"</p>
                        <p className="font-bold text-text-charcoal dark:text-white">{t.name}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
