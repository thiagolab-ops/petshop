export const mockCategories = [
    { id: 'cat-1', name: 'Cabelo', order: 1, isActive: true },
    { id: 'cat-2', name: 'Estética Facial', order: 2, isActive: true },
    { id: 'cat-3', name: 'Unhas', order: 3, isActive: true },
];

export const mockServices = [
    {
        id: 'prod-1',
        name: 'Corte e Escova',
        description: 'Corte personalizado e escova modeladora para um visual impecável.',
        ingredients: 'Lavagem completa com produtos premium, corte, hidratação rápida e escova',
        price: 120.00,
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        category: 'Cabelo',
        isAvailable: true,
        isVegan: false,
        isGlutenFree: false,
        isNew: false,
        isBestSeller: true,
        isOffer: false,
        tags: ['Mais Vendido'],
        categoryRef: { id: 'cat-1', name: 'Cabelo', order: 1 }
    },
    {
        id: 'prod-2',
        name: 'Limpeza de Pele Profunda',
        description: 'Protocolo completo para remoção de cravos, miliuns e células mortas.',
        ingredients: 'Higienização, esfoliação, extração, máscara calmante e proteção solar',
        price: 150.00,
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        category: 'Estética Facial',
        isAvailable: true,
        isVegan: false,
        isGlutenFree: false,
        isNew: true,
        isBestSeller: true,
        isOffer: true,
        tags: ['Pele'],
        categoryRef: { id: 'cat-2', name: 'Estética Facial', order: 2 }
    },
    {
        id: 'prod-3',
        name: 'Manicure e Pedicure',
        description: 'Tratamento completo para unhas das mãos e dos pés, com esmaltação e hidratação.',
        ingredients: 'Cutilagem, modelagem das unhas, esmaltação e massagem relaxante',
        price: 80.00,
        imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
        category: 'Unhas',
        isAvailable: true,
        isVegan: false,
        isGlutenFree: false,
        isNew: false,
        isBestSeller: false,
        isOffer: false,
        tags: ['Unhas', 'Clássica'],
        categoryRef: { id: 'cat-3', name: 'Unhas', order: 3 }
    },
    {
        id: 'prod-4',
        name: 'Massagem Relaxante',
        description: 'Massagem corporal relaxante com óleos essenciais para alívio de tensões.',
        ingredients: 'Óleos essenciais premium, ambiente climatizado, cromoterapia',
        price: 180.00,
        imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
        category: 'Massoterapia',
        isAvailable: true,
        isVegan: false,
        isGlutenFree: false,
        isNew: false,
        isBestSeller: true,
        isOffer: false,
        tags: ['Relaxante'],
        categoryRef: { id: 'cat-4', name: 'Massoterapia', order: 4 }
    }
];

export const mockCombos = [
    {
        id: 'combo-1',
        name: 'Combo Dia de Princesa',
        description: 'Massagem Relaxante + Limpeza de Pele + Manicure',
        price: 350.00,
        imageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
        isActive: true,
    }
];

export const mockSettings = {
    discountActive: true,
    discountPercentage: 10
}
