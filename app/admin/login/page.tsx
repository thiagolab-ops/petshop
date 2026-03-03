'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Erro no login',
          description: 'Credenciais inválidas',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Login realizado!',
          description: 'Redirecionando...',
        })
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl border border-primary/30 shadow-xl shadow-primary/10 w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-gray-800">Bela Estética <span className="text-primary">Admin</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@infopedia.com"
              required
              className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
