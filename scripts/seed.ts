import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados (Bela Estética)...')

  // Limpar dados existentes
  await prisma.appointment.deleteMany()
  await prisma.loyalty.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.combo.deleteMany()
  // Now using service instead of product
  await prisma.service.deleteMany()
  await prisma.category.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Dados anteriores removidos')

  // Criar categorias
  const cabeloCategory = await prisma.category.create({
    data: { name: 'Cabelo', order: 0, isActive: true },
  })

  const unhasCategory = await prisma.category.create({
    data: { name: 'Unhas', order: 1, isActive: true },
  })

  const esteticaFacialCategory = await prisma.category.create({
    data: { name: 'Estética Facial', order: 2, isActive: true },
  })

  const massoterapiaCategory = await prisma.category.create({
    data: { name: 'Massoterapia', order: 3, isActive: true },
  })

  console.log('✅ Categorias criadas')

  // Criar usuários admin
  const hashedPassword1 = await bcrypt.hash('johndoe123', 10)
  const hashedPassword2 = await bcrypt.hash('123456', 10)

  const adminUser1 = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword1,
      name: 'Admin Test',
      role: 'admin',
    },
  })

  const adminUser2 = await prisma.user.create({
    data: {
      email: 'admin@belaestetica.com.br',
      password: hashedPassword2,
      name: 'Bela Estetica Admin',
      role: 'admin',
    },
  })

  console.log('✅ Usuários admin criados')

  // Criar serviços
  const corte = await prisma.service.create({
    data: {
      name: 'Corte e Escova',
      price: 120.00,
      duration: 60,
      description: 'Corte personalizado e escova modeladora para um visual impecável.',
      ingredients: 'Lavagem completa com produtos premium, corte, hidratação rápida e escova',
      imageUrl: 'https://cdn.abacus.ai/images/placeholder_corte.png', // Temporary placeholder
      category: 'Cabelo',
      categoryId: cabeloCategory.id,
      tags: ['Mais Vendido'],
      isBestSeller: true,
      isAvailable: true,
    },
  })

  const manicure = await prisma.service.create({
    data: {
      name: 'Manicure e Pedicure',
      price: 80.00,
      duration: 90,
      description: 'Tratamento completo para unhas das mãos e dos pés, com esmaltação e hidratação.',
      ingredients: 'Cutilagem, modelagem das unhas, esmaltação e massagem relaxante nas mãos e pés',
      imageUrl: 'https://cdn.abacus.ai/images/placeholder_unhas.png',
      category: 'Unhas',
      categoryId: unhasCategory.id,
      tags: ['Mais Vendido'],
      isBestSeller: true,
      isAvailable: true,
    },
  })

  const limpezaPele = await prisma.service.create({
    data: {
      name: 'Limpeza de Pele Profunda',
      price: 150.00,
      duration: 45,
      description: 'Protocolo completo para remoção de cravos, miliuns e células mortas.',
      ingredients: 'Higienização, esfoliação, extração, máscara calmante e proteção solar',
      imageUrl: 'https://cdn.abacus.ai/images/placeholder_facial.png',
      category: 'Estética Facial',
      categoryId: esteticaFacialCategory.id,
      tags: ['Novidade'],
      isNew: true,
      isAvailable: true,
    },
  })

  const massagem = await prisma.service.create({
    data: {
      name: 'Massagem Relaxante',
      price: 180.00,
      duration: 60,
      description: 'Massagem corporal relaxante com óleos essenciais para alívio de tensões.',
      ingredients: 'Óleos essenciais premium, ambiente climatizado, cromoterapia',
      imageUrl: 'https://cdn.abacus.ai/images/placeholder_massagem.png',
      category: 'Massoterapia',
      categoryId: massoterapiaCategory.id,
      tags: [],
      isAvailable: true,
    },
  })

  console.log('✅ Serviços de beleza criados')

  // Criar configurações padrão
  await prisma.settings.create({
    data: {
      discountPercentage: 0,
      discountActive: false,
      loyaltyPurchasesNeeded: 10,
      whatsappNumber: '5511999999999',
      pixKey: 'belaestetica@pix.com.br',
    },
  })

  console.log('✅ Configurações criadas')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Resumo:')
  console.log(`- ${2} usuários admin criados`)
  console.log(`- ${4} serviços criados`)
  console.log('\n🔐 Credenciais de acesso:')
  console.log('  Admin 1: john@doe.com / johndoe123')
  console.log('  Admin 2: admin@belaestetica.com.br / 123456')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
