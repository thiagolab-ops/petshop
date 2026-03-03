
export const mockAdminOrders = [
    {
        id: 'PED-MOCK-001',
        customerName: 'João Silva',
        customerPhone: '11999999999',
        address: {
            rua: 'Rua das Flores',
            numero: '123',
            bairro: 'Centro',
            referencia: 'Próximo à praça'
        },
        paymentMethod: 'PIX',
        status: 'Pendente',
        total: 89.90,
        estimatedTime: '30-45 min',
        items: [
            {
                id: 'item-1',
                name: 'Pizza Calabresa',
                price: 49.90,
                quantity: 1,
                isHalf: false
            },
            {
                id: 'item-2',
                name: 'Coca-Cola 2L',
                price: 12.00,
                quantity: 1,
                isHalf: false
            },
            {
                id: 'item-3',
                name: 'Petit Gâteau',
                price: 28.00, // 22.90 + extra
                quantity: 1,
                isHalf: false
            }
        ],
        confirmedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'PED-MOCK-002',
        customerName: 'Maria Oliveira',
        customerPhone: '11988888888',
        address: {
            rua: 'Av. Paulista',
            numero: '1000',
            bairro: 'Bela Vista',
            referencia: 'Apto 45'
        },
        paymentMethod: 'Cartão de Crédito',
        status: 'Em Preparo',
        total: 115.80,
        estimatedTime: '45-60 min',
        items: [
            {
                id: 'item-4',
                name: 'Pizza Quatro Queijos',
                price: 55.90,
                quantity: 2,
                isHalf: false
            }
        ],
        confirmedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    },
    {
        id: 'PED-MOCK-003',
        customerName: 'Carlos Souza',
        customerPhone: '11977777777',
        address: {
            rua: 'Rua Augusta',
            numero: '500',
            bairro: 'Consolação',
            referencia: ''
        },
        paymentMethod: 'Dinheiro',
        status: 'Saiu para Entrega',
        total: 65.90,
        estimatedTime: '20-30 min',
        items: [
            {
                id: 'item-5',
                name: 'Pizza Portuguesa',
                price: 52.90,
                quantity: 1,
                isHalf: true,
                halfFlavors: ['Portuguesa', 'Calabresa']
            },
            {
                id: 'item-6',
                name: 'Guaraná Antarctica 2L',
                price: 10.00,
                quantity: 1
            }
        ],
        confirmedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString()
    },
    {
        id: 'PED-MOCK-004',
        customerName: 'Ana Pereira',
        customerPhone: '11966666666',
        address: {
            rua: 'Rua da Consolação',
            numero: '200',
            bairro: 'Centro',
            referencia: 'Ao lado do metrô'
        },
        paymentMethod: 'PIX',
        status: 'Entregue',
        total: 45.90,
        estimatedTime: null,
        items: [
            {
                id: 'item-7',
                name: 'Pizza Margherita',
                price: 45.90,
                quantity: 1,
                isHalf: false
            }
        ],
        confirmedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString()
    }
];
