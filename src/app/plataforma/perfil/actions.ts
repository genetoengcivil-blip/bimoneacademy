'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Usuário não autenticado")

  const full_name = formData.get('full_name') as string
  const avatarFile = formData.get('avatar') as File | null
  let avatar_url = formData.get('current_avatar_url') as string

  // Se o usuário selecionou um arquivo e ele é válido
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    // Gera um nome único para o arquivo para evitar cache
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile)

    if (uploadError) {
      console.error("Erro no Upload:", uploadError)
      throw new Error("Erro ao salvar a imagem no banco.")
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    avatar_url = publicUrlData.publicUrl
  }

  // Faz a atualização no perfil
  const { error } = await supabase
    .from('profiles')
    .update({ full_name, avatar_url })
    .eq('id', user.id)

  if (error) {
    console.error("Erro no Update:", error)
    throw new Error(error.message)
  }

  // Recarrega as páginas para mostrar a nova foto
  revalidatePath('/plataforma/perfil')
  revalidatePath('/plataforma')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) throw new Error('As senhas não coincidem.')
  if (newPassword.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)

  revalidatePath('/plataforma/perfil')
}