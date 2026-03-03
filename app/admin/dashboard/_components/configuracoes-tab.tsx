'use client'

import { useState, useEffect } from 'react'
import { Truck, Shield, Save, Loader2, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConfiguracoesTab() {
  // Delivery settings
  const [deliveryFee, setDeliveryFee] = useState('')
  const [freeDelivery, setFreeDelivery] = useState(false)
  const [pixKey, setPixKey] = useState('')
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        setDeliveryFee(data.settings.deliveryFee?.toString() || '5')
        setFreeDelivery(data.settings.freeDelivery || false)
        setPixKey(data.settings.pixKey || '')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const handleSaveDeliverySettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSavingSettings(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryFee: parseFloat(deliveryFee) || 0,
          freeDelivery,
          pixKey,
        }),
      })

      if (res.ok) {
        toast.success('Configurações de entrega salvas!')
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem')
      return
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Senha alterada com sucesso!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast.error('Erro ao alterar senha')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Seção: Configurações do Salão */}
      <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/20 p-3 rounded-lg">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Configurações do Salão</h2>
          </div>
        </div>

        <form onSubmit={handleSaveDeliverySettings} className="space-y-6">
          {/* Chave PIX */}
          <div className="p-4 bg-gray-700/50 rounded-lg border border-primary/20">
            <label className="text-white font-semibold block mb-2">Chave PIX</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:outline-none"
              placeholder="belaestetica@pix.com.br"
            />
            <p className="text-gray-400 text-sm mt-2">Chave PIX exibida para os clientes no pagamento</p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-primary/80 font-semibold mb-2">Preview no Carrinho:</p>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center text-gray-300">
                <span>Subtotal</span>
                <span>R$ 89,90</span>
              </div>
              <div className="flex justify-between items-center text-white font-bold mt-2 pt-2 border-t border-gray-700">
                <span>Total</span>
                <span className="text-primary">
                  R$ 89,90
                </span>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={isSavingSettings}
            className="w-full bg-primary text-black py-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSavingSettings ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Configurações do Salão
              </>
            )}
          </button>
        </form>
      </div>

      {/* Seção: Segurança */}
      < div className="bg-gray-800 rounded-xl border border-primary/30 p-6" >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/20 p-3 rounded-lg">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Segurança</h2>
            <p className="text-gray-400 text-sm">Altere sua senha de acesso ao painel administrativo</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Senha Atual */}
          <div>
            <label className="text-white font-semibold block mb-2">Senha Atual</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg border border-primary/30 focus:border-primary focus:outline-none"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className="text-white font-semibold block mb-2">Nova Senha</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg border border-primary/30 focus:border-primary focus:outline-none"
                placeholder="Digite a nova senha (mínimo 6 caracteres)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {newPassword && newPassword.length < 6 && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                A senha deve ter pelo menos 6 caracteres
              </p>
            )}
            {newPassword && newPassword.length >= 6 && (
              <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Senha válida
              </p>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div>
            <label className="text-white font-semibold block mb-2">Confirmar Nova Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg border border-primary/30 focus:border-primary focus:outline-none"
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                As senhas não coincidem
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
              <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Senhas coincidem
              </p>
            )}
          </div>

          {/* Botão Alterar Senha */}
          <button
            type="submit"
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isChangingPassword ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Alterar Senha
              </>
            )}
          </button>
        </form>
      </div >
    </div >
  )
}

