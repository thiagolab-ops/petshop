import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'A nova senha e a confirmação não coincidem' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    )
  }
}
