import { NextRequest, NextResponse } from 'next/server'
import { generatePresignedUploadUrl, getFileUrl } from '@/lib/s3'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { fileName, contentType } = await request.json()

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Nome do arquivo e tipo são obrigatórios' }, { status: 400 })
    }

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      fileName,
      contentType,
      true // isPublic = true para imagens do cardápio
    )

    // Gerar URL pública para acessar a imagem após upload
    const fileUrl = await getFileUrl(cloud_storage_path, true)

    return NextResponse.json({ uploadUrl, cloud_storage_path, fileUrl })
  } catch (error) {
    console.error('Erro ao gerar URL de upload:', error)
    return NextResponse.json({ error: 'Erro ao gerar URL de upload' }, { status: 500 })
  }
}
