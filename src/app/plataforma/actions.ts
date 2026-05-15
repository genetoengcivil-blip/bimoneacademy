'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleLessonCompletion(lessonId: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  if (isCompleted) {
    await supabase.from('user_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId)
  } else {
    await supabase.from('user_progress').insert([{ user_id: user.id, lesson_id: lessonId }])
  }
  revalidatePath(`/plataforma/aula/${lessonId}`)
}

export async function saveUserNote(lessonId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from('user_notes').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    content,
    updated_at: new Date().toISOString()
  })

  if (error) console.error(error)
  revalidatePath(`/plataforma/aula/${lessonId}`)
}

export async function postComment(lessonId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('lesson_comments').insert({
    lesson_id: lessonId,
    user_id: user.id,
    user_email: user.email,
    content
  })

  revalidatePath(`/plataforma/aula/${lessonId}`)
}