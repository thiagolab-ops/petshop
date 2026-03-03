import { prisma } from '@/lib/db'
import ServicosPageClient from './servicos-page-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const servicos = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="w-full min-h-screen bg-stone-50 font-sans text-brand-dark">
      <ServicosPageClient initialServices={servicos} />
    </div>
  )
}
