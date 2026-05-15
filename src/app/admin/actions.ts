'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatVideoUrl(url: string) {
  let embedUrl = url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    embedUrl = `https://www.youtube.com/embed/${match[2]}`;
  }
  return embedUrl;
}

export async function saveModule(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const order_index = parseInt(formData.get('order_index') as string)
  const category = formData.get('category') as string

  const data = { title, order_index, category }
  
  const { error } = id 
    ? await supabase.from('modules').update(data).eq('id', id) 
    : await supabase.from('modules').insert([data])
    
  if (error) throw new Error(error.message)
  revalidatePath('/admin'); revalidatePath('/plataforma')
}

export async function deleteModule(id: string) {
  const supabase = await createClient()
  await supabase.from('modules').delete().eq('id', id)
  revalidatePath('/admin'); revalidatePath('/plataforma')
}

export async function saveLesson(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const module_id = formData.get('module_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const raw_video_url = formData.get('video_url') as string
  const duration = formData.get('duration') as string
  const order_index = parseInt(formData.get('order_index') as string)
  const category = formData.get('category') as string // Coleta da nova classificação da aula
  const video_url = formatVideoUrl(raw_video_url)
  
  const data = { module_id, title, description, video_url, duration, order_index, category }
  
  const { error } = id 
    ? await supabase.from('lessons').update(data).eq('id', id) 
    : await supabase.from('lessons').insert([data])
    
  if (error) throw new Error(error.message)
  revalidatePath('/admin'); revalidatePath('/plataforma')
}

export async function deleteLesson(id: string) {
  const supabase = await createClient()
  await supabase.from('lessons').delete().eq('id', id)
  revalidatePath('/admin'); revalidatePath('/plataforma')
}

export async function addMaterial(formData: FormData) {
  const supabase = await createClient()
  const lesson_id = formData.get('lesson_id') as string
  const title = formData.get('title') as string
  const url = formData.get('url') as string
  await supabase.from('lesson_materials').insert([{ lesson_id, title, url }])
  revalidatePath('/admin'); revalidatePath('/plataforma')
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient()
  await supabase.from('lesson_materials').delete().eq('id', id)
  revalidatePath('/admin'); revalidatePath('/plataforma')
}

export async function replyToComment(formData: FormData) {
  const supabase = await createClient()
  const commentId = formData.get('commentId') as string
  const admin_reply = formData.get('reply') as string

  const { error } = await supabase
    .from('lesson_comments')
    .update({ 
      admin_reply, 
      replied_at: new Date().toISOString() 
    })
    .eq('id', commentId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateAlunoProfile(formData: FormData) {
  const id = formData.get('alunoId') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string
  const plan = formData.get('plan') as string

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ full_name, role, plan })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteAlunoProfile(formData: FormData) {
  const id = formData.get('alunoId') as string

  await supabaseAdmin.from('user_progress').delete().eq('user_id', id)
  await supabaseAdmin.from('lesson_comments').delete().eq('user_id', id)
  await supabaseAdmin.from('profiles').delete().eq('id', id)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function addTransaction(formData: FormData) {
  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string) || 0
  const type = formData.get('type') as string
  const date = formData.get('date') as string

  const { error } = await supabaseAdmin
    .from('financial_transactions')
    .insert([{ description, amount, type, date }])

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteTransaction(id: string) {
  const { error } = await supabaseAdmin
    .from('financial_transactions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}