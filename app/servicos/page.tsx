export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ServicosPage from './_components/servicos-page'
import Chatbot from '@/components/chatbot'

export default function Page() {
  return (
    <div className="w-full min-h-screen">
      <ServicosPage />
      <Chatbot />
    </div>
  )
}
