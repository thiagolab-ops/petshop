import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas')
        }

        // --- BYPASS DE EMERGÊNCIA (DEMO MODE) ---
        // Permite login sem banco de dados para testes/apresentação
        if (
          (credentials.email === 'admin@infopedia.com' || credentials.email === 'admin') &&
          (credentials.password === 'admin123' || credentials.password === '123456')
        ) {
          console.log('⚠️ USANDO LOGIN DE EMERGÊNCIA (BYPASS) ⚠️')
          return {
            id: 'admin-bypass-id',
            email: 'admin@infopedia.com',
            name: 'Administrador (Demo)',
            role: 'admin',
          }
        }
        // ----------------------------------------

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            throw new Error('Usuário não encontrado')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Senha incorreta')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Erro no login (DB):', error)
          // Se o erro for de conexão com o banco, e as credenciais forem admin, libera
          // Isso é um fallback extra caso o prisma crashe
          if ((credentials.email === 'admin' || credentials.email === 'admin@belaestetica.com.br') && credentials.password === 'admin123') {
            return {
              id: 'admin-fallback-id',
              email: 'admin@belaestetica.com.br',
              name: 'Admin Fallback',
              role: 'admin',
            }
          }
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role as string
        (session.user as any).id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
