import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { toggleLessonCompletion, saveUserNote, postComment } from '@/app/plataforma/actions'
import Link from 'next/link'
import { 
  ChevronLeft, Play, Layers, LogOut, CheckCircle, FileBox, 
  PenTool, MessageCircle, DownloadCloud, Share2, ShieldCheck 
} from 'lucide-react'

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Busca os detalhes da aula atual e o módulo ao qual ela pertence
  const { data: currentLesson } = await supabase
    .from('lessons')
    .select('*, modules(*)')
    .eq('id', id)
    .single()

  if (!currentLesson) notFound()

  // 2. Busca todas as aulas do mesmo módulo para a barra lateral
  const { data: moduleLessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', currentLesson.module_id)
    .order('order_index', { ascending: true })

  // 3. Busca Materiais da Aula
  const { data: materials } = await supabase
    .from('lesson_materials')
    .select('*')
    .eq('lesson_id', id)

  // 4. Busca Anotação Pessoal do usuário para esta aula
  const { data: note } = await supabase
    .from('user_notes')
    .select('content')
    .eq('user_id', user?.id)
    .eq('lesson_id', id)
    .single()

  // 5. Busca Comentários/Perguntas da aula
  const { data: comments } = await supabase
    .from('lesson_comments')
    .select('*')
    .eq('lesson_id', id)
    .order('created_at', { ascending: false })

  // 6. Verifica se o usuário já concluiu esta aula
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user?.id)
    .eq('lesson_id', id)
    .single()

  const isCompleted = !!progress

  return (
    <div className="flex h-screen bg-[#0B0D17] text-slate-50 font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* SIDEBAR DO MÓDULO */}
      <aside className="hidden lg:flex w-80 bg-black/40 border-r border-white/5 flex-col overflow-hidden relative z-20 backdrop-blur-xl">
        <div className="p-6 border-b border-white/5">
          <Link href="/plataforma" className="flex items-center gap-3 mb-6 text-slate-400 hover:text-white transition-colors group">
            <div className="bg-white/5 p-1.5 rounded-lg group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Voltar ao Início</span>
          </Link>
          
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Layers className="h-4 w-4" />
            <h2 className="font-bold text-xs uppercase tracking-widest truncate">
              {currentLesson.modules?.title}
            </h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          {moduleLessons?.map((lesson) => {
            const isActive = lesson.id === currentLesson.id;
            return (
              <Link 
                key={lesson.id} 
                href={`/plataforma/aula/${lesson.id}`}
                className={`flex items-start gap-3 p-3.5 rounded-xl transition-all group relative overflow-hidden ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/30" 
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>}
                
                <div className={`mt-0.5 shrink-0 rounded-full p-1 ${isActive ? "bg-blue-400 text-slate-900" : "bg-white/5 text-slate-500 group-hover:text-white transition-colors"}`}>
                  <Play className={`h-3 w-3 ${isActive ? "fill-current" : ""}`} />
                </div>
                
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-sm font-medium line-clamp-2 leading-snug ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {lesson.order_index}. {lesson.title}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">{lesson.duration || "Aula"}</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <form action={logout}>
            <button className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors text-sm font-medium w-full p-3 rounded-xl">
              <LogOut className="h-4 w-4" />
              Sair da Plataforma
            </button>
          </form>
        </div>
      </aside>

      {/* ÁREA DO PLAYER E CONTEÚDO */}
      <main className="flex-1 flex flex-col overflow-y-auto scroll-smooth relative bg-[#0B0D17]">
        
        {/* PLAYER THEATER MODE */}
        <section className="w-full bg-black relative flex flex-col justify-center border-b border-white/5 shadow-2xl z-10">
          <div className="w-full max-w-6xl mx-auto aspect-video relative group">
            <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <iframe
              className="w-full h-full relative z-10"
              src={currentLesson.video_url}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* DETALHES E INTERAÇÃO */}
        <div className="max-w-7xl mx-auto w-full p-8 lg:p-12">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">{currentLesson.title}</h1>
              <p className="text-slate-400 font-medium tracking-wide">BIM One Academy • Instrutor: Geraldo Neves</p>
            </div>
            
            <form action={async () => {
              'use server'
              await toggleLessonCompletion(id, isCompleted)
            }}>
              <button className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all shadow-lg transform hover:scale-105 ${
                isCompleted 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-900/20" 
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/30"
              }`}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                {isCompleted ? "Aula Concluída" : "Marcar Conclusão"}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            
            {/* COLUNA DA ESQUERDA (DESCRIÇÃO E FÓRUM) */}
            <div className="xl:col-span-2 space-y-10">
              
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                  <FileBox className="text-blue-500 h-6 w-6" /> Descrição da Aula
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {currentLesson.description || "Nenhuma descrição detalhada disponível."}
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <MessageCircle className="text-emerald-500 h-6 w-6" /> Perguntas e Suporte
                </h3>
                
                <form action={async (formData) => {
                  'use server'
                  const content = formData.get('comment') as string
                  if (content) await postComment(id, content)
                }} className="mb-10">
                  <textarea 
                    name="comment"
                    placeholder="Tire sua dúvida técnica sobre esta aula..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-blue-500 transition-all resize-none min-h-[120px] mb-4 outline-none"
                  ></textarea>
                  <div className="flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors">
                      Enviar Pergunta
                    </button>
                  </div>
                </form>

                <div className="space-y-8">
                  {comments?.map(c => (
                    <div key={c.id} className="space-y-4">
                      {/* Pergunta do Aluno */}
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{c.user_email}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{c.content}</p>
                      </div>
                      
                      {/* Resposta do Instrutor (Geraldo Neves) */}
                      {c.admin_reply && (
                        <div className="ml-8 p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20 relative shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Resposta do Instrutor</span>
                          </div>
                          <p className="text-sm text-slate-200 font-medium">{c.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUNA DA DIREITA (MATERIAIS E ANOTAÇÕES) */}
            <div className="space-y-8">
              
              <div className="bg-gradient-to-b from-blue-900/20 to-transparent border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-300">
                  <DownloadCloud className="h-6 w-6" /> Materiais de Apoio
                </h3>
                <div className="space-y-3">
                  {materials && materials.length > 0 ? (
                    materials.map(m => (
                      <a key={m.id} href={m.url} target="_blank" className="flex items-center justify-between p-4 bg-black/40 hover:bg-blue-600/20 border border-white/5 rounded-xl transition-all group">
                        <span className="text-sm font-semibold text-slate-300 group-hover:text-white truncate pr-4">{m.title}</span>
                        <DownloadCloud className="h-4 w-4 text-slate-500 group-hover:text-blue-400 shrink-0" />
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhum arquivo anexado a esta aula.</p>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-3 text-yellow-500">
                  <PenTool className="h-5 w-5" /> Minhas Notas
                </h3>
                <p className="text-[10px] text-slate-500 mb-6 font-bold uppercase tracking-widest">Privado: Apenas você pode ver</p>
                
                <form action={async (formData) => {
                  'use server'
                  const content = formData.get('note') as string
                  await saveUserNote(id, content)
                }}>
                  <textarea 
                    name="note"
                    defaultValue={note?.content || ''}
                    placeholder="Anotações sobre comandos do Revit, atalhos ou insights..."
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-5 text-slate-300 text-sm focus:border-yellow-500/50 transition-all resize-none min-h-[250px] mb-4 leading-relaxed outline-none"
                  ></textarea>
                  <button className="w-full bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 text-slate-400 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border border-white/5 transition-all">
                    Salvar Anotação
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}