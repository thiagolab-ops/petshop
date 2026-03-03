import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

import { mockCategories, mockServices, mockCombos, mockSettings } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  // Check for force mock data environment variable
  const forceMock = process.env.USE_MOCK_DATA === 'true'

  if (forceMock) {
    console.log('Using Mock Data (Forced)')
    return NextResponse.json({
      categories: mockCategories,
      services: mockServices,
      combos: mockCombos,
      discount: mockSettings.discountActive ? mockSettings.discountPercentage : 0,
      servicePromotions: {},
    })
  }

  try {
    // Buscar categorias ativas ordenadas
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, order: true }
    })

    const services = await prisma.service.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
      include: {
        categoryRef: {
          select: { id: true, name: true, order: true }
        }
      }
    })

    const combos = await prisma.combo.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    const settings = await prisma.settings.findFirst()

    // Buscar promoções ativas
    const now = new Date()
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      }
    })

    // Criar mapa de produtos em promoção
    const servicePromotions: { [serviceId: string]: { discountPercentage: number; promotionName: string } } = {}

    promotions.forEach(promo => {
      promo.serviceIds.forEach(serviceId => {
        // Se já tem uma promoção maior, não sobrescreve
        if (!servicePromotions[serviceId] || servicePromotions[serviceId].discountPercentage < promo.discountPercentage) {
          servicePromotions[serviceId] = {
            discountPercentage: promo.discountPercentage,
            promotionName: promo.name,
          }
        }
      })
    })

    return NextResponse.json({
      categories,
      services,
      combos,
      discount: settings?.discountActive ? settings.discountPercentage : 0,
      servicePromotions,
    })
  } catch (error) {
    console.error('Erro ao buscar cardápio, usando fallback:', error)

    // Fallback to mock data on error
    return NextResponse.json({
      categories: mockCategories,
      services: mockServices,
      combos: mockCombos,
      discount: mockSettings.discountActive ? mockSettings.discountPercentage : 0,
      servicePromotions: {},
    })
  }
}
