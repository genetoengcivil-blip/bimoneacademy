import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { 
  Play, Layers, CheckCircle2, Award, LogOut, Home, Compass, 
  MessageCircle, Settings, Bell, Search as SearchIcon, BookOpen, User,
  ShieldCheck, Clock, MessageSquare, ArrowRight, Menu, X, Lock
} from 'lucide-react'

export default async function PlataformaPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string, q?: string, curso?: string }> 
}) {
  const resolvedParams = await searchParams
  const currentTab = resolvedParams.tab || 'inicio'
  const searchQuery = resolvedParams.q || ''
  const activeCurso = resolvedParams.curso || 'arquitetura'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: modules } = await supabase
    .from('modules')
    .select(`*, lessons (*)`)
    .order('order_index', { ascending: true })
    .order('order_index', { foreignTable: 'lessons', ascending: true })

  const { data: progressData } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', user?.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, avatar_url, full_name, plan')
    .eq('id', user?.id)
    .single()

  const { data: notifications } = await supabase
    .from('lesson_comments')
    .select('*, lessons(title, id)')
    .eq('user_id', user?.id)
    .not('admin_reply', 'is', null)
    .order('replied_at', { ascending: false })
    .limit(5)

  const { data: communityFeed } = currentTab === 'comunidade' 
    ? await supabase
        .from('lesson_comments')
        .select('*, lessons(title, id)')
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: null }

  const isAdmin = profile?.role === 'admin'
  const completedLessonIds = progressData?.map(p => p.lesson_id) || []

  const allLessons = modules?.flatMap(m => m.lessons) || []
  const completedLessonsCount = completedLessonIds.length
  const globalProgress = allLessons.length > 0 
    ? Math.round((completedLessonsCount / allLessons.length) * 100) 
    : 0

  const alunoNome = profile?.full_name || user?.email?.split('@')[0] || 'Aluno'
  const planoAtual = profile?.plan || 'basico'

  let temAcessoAoCurso = false
  if (activeCurso === 'arquitetura') {
    temAcessoAoCurso = true
  } else if (activeCurso === 'mep') {
    temAcessoAoCurso = planoAtual === 'intermediario' || planoAtual === 'avancado'
  } else if (activeCurso === 'estrutural') {
    temAcessoAoCurso = planoAtual === 'avancado'
  }

  let displayModules = modules || []
  displayModules = displayModules.filter(m => m.category === activeCurso)
  
  if (searchQuery) {
    displayModules = displayModules.map(m => ({
      ...m,
      lessons: m.lessons.filter((l: any) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(m => m.lessons.length > 0)
  }

  if (currentTab === 'cursos') {
    displayModules = displayModules.filter(m => 
      m.lessons.some((l: any) => completedLessonIds.includes(l.id))
    )
  }

  const navItems = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'explorar', label: 'Explorar', icon: Compass },
    { id: 'cursos', label: 'Meus Cursos', icon: BookOpen },
    { id: 'comunidade', label: 'Comunidade', icon: MessageCircle },
  ]

  const planLabels: { [key: string]: { label: string, color: string } } = {
    basico: { label: 'Plano Básico', color: 'text-slate-400 bg-white/5 border-white/5' },
    intermediario: { label: 'Plano Intermediário', color: 'text-amber-400 bg-amber-500/10 border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.05)]' },
    avancado: { label: 'Plano Avançado Premium', color: 'text-blue-400 bg-blue-500/10 border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' }
  }

  return (
    <div className="flex h-screen bg-[#0B0D17] text-slate-50 font-sans overflow-hidden selection:bg-blue-600 selection:text-white relative">
      
      {/* CHECKBOX OCULTO PARA CONTROLE DO MENU MOBILE */}
      <input type="checkbox" id="mobile-menu" className="peer/menu hidden" />
      
      {/* OVERLAY ESCURO PARA MOBILE */}
      <label 
        htmlFor="mobile-menu" 
        className="fixed inset-0 bg-black/80 z-[55] hidden peer-checked/menu:block lg:hidden backdrop-blur-sm transition-opacity cursor-pointer"
      ></label>

      {/* SIDEBAR LATERAL RETRÁTIL */}
      <aside className="fixed lg:relative top-0 left-0 h-full z-[60] w-64 lg:w-20 xl:w-64 -translate-x-full peer-checked/menu:translate-x-0 lg:translate-x-0 bg-black/95 lg:bg-black/50 border-r border-white/5 flex flex-col shrink-0 transition-transform duration-300 backdrop-blur-xl">
        <div className="h-24 flex items-center justify-between px-6 lg:justify-center xl:justify-start xl:px-8">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-blue-500 shrink-0" />
            <span className="font-extrabold tracking-tighter text-xl text-white ml-3 block lg:hidden xl:block">
              BIM ONE
            </span>
          </div>
          <label htmlFor="mobile-menu" className="p-2 bg-white/5 rounded-xl text-white lg:hidden cursor-pointer hover:bg-white/10">
            <X className="h-5 w-5" />
          </label>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-2 px-3 lg:px-2 xl:px-3 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id && !searchQuery
            return (
              <Link 
                key={item.id}
                href={`/plataforma?tab=${item.id}&curso=${activeCurso}`} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                  isActive 
                  ? "bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border-l-2 border-blue-500" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${!isActive && "group-hover:scale-110 transition-transform"}`} />
                <span className={`block lg:hidden xl:block ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
              </Link>
            )
          })}
          
          <Link href="/plataforma/perfil" className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group mt-4">
            <User className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium block lg:hidden xl:block">Meu Perfil</span>
          </Link>
        </nav>

        <div className="p-3 lg:p-2 xl:p-4 border-t border-white/5 flex flex-col gap-2 bg-black/20 lg:bg-transparent">
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
              <Settings className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-sm block lg:hidden xl:block">Painel Admin</span>
            </Link>
          )}
          <form action={logout}>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-left">
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm block lg:hidden xl:block">Sair</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[#0B0D17]">
        
        {/* HEADER TOP RESPONSIVO */}
        <header className="absolute top-0 w-full z-40 h-24 flex items-center justify-between px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-black/90 lg:from-black/80 to-transparent">
          
          {/* Botão Hambúrguer Mobile */}
          <div className="lg:hidden">
            <label htmlFor="mobile-menu" className="p-2 bg-white/5 border border-white/10 rounded-xl text-white cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center backdrop-blur-md">
              <Menu className="h-6 w-6" />
            </label>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 ml-auto">
            <form action="/plataforma" method="GET" className="relative group hidden md:block">
              <input type="hidden" name="tab" value="explorar" />
              <input type="hidden" name="curso" value={activeCurso} />
              <div className="flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2 focus-within:border-blue-500 focus-within:bg-black/80 transition-all backdrop-blur-md">
                <SearchIcon className="h-4 w-4 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={searchQuery}
                  placeholder="Buscar..." 
                  className="bg-transparent border-none outline-none text-sm text-white w-24 lg:w-32 focus:w-48 transition-all"
                />
              </div>
            </form>

            <div className="relative group">
              <button className="text-white/70 hover:text-white transition-colors relative p-2 bg-white/5 rounded-full lg:bg-transparent lg:rounded-none">
                <Bell className="h-5 w-5" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute top-1 right-1 lg:top-1 lg:right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#0B0D17]"></span>
                )}
              </button>
              
              <div className="absolute right-[-40px] sm:right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl hidden group-hover:block overflow-hidden z-50">
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                  <h4 className="font-bold text-sm">Suas Notificações</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications && notifications.length > 0 ? notifications.map(notif => (
                    <Link key={notif.id} href={`/plataforma/aula/${notif.lessons?.id}`} className="block p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors">
                      <p className="text-xs text-blue-400 font-bold mb-1">Instrutor respondeu sua dúvida!</p>
                      <p className="text-xs text-slate-300 line-clamp-2 mb-2">"{notif.admin_reply}"</p>
                      <p className="text-[10px] text-slate-500 uppercase">Aula: {notif.lessons?.title}</p>
                    </Link>
                  )) : (
                    <div className="p-6 text-center text-sm text-slate-500">Nenhuma notificação nova.</div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD DE PERFIL PREMIUM GLASSMORPHISM */}
            <Link 
              href="/plataforma/perfil" 
              className="flex items-center gap-2.5 sm:gap-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/40 rounded-2xl p-1.5 sm:p-2 sm:pr-4 transition-all duration-300 group/prof backdrop-blur-md relative shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover/prof:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs sm:text-sm border border-white/10 overflow-hidden shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.email?.substring(0, 2).toUpperCase()
                )}
              </div>

              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-slate-200 group-hover/prof:text-white transition-colors line-clamp-1">{alunoNome}</span>
                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 mt-0.5 rounded border transition-all ${planLabels[planoAtual]?.color}`}>
                  {planLabels[planoAtual]?.label}
                </span>
              </div>
            </Link>

          </div>
        </header>

        {/* CONTEÚDO DINÂMICO DE ABAS */}
        {(currentTab === 'inicio' || currentTab === 'explorar' || currentTab === 'cursos') && (
          <>
            {!searchQuery && currentTab === 'inicio' && (
              <section className="relative w-full min-h-[450px] sm:min-h-[500px] h-[55vh] flex items-end pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12 pt-32 lg:pt-0">
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-900 via-blue-900/20 to-slate-900 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-3xl">
                  <div className="flex items-center gap-2 text-blue-400 font-bold tracking-widest text-xs uppercase mb-3">
                    <Award className="h-4 w-4" /> Jornada BIM One
                  </div>
                  <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-3 tracking-tight text-white drop-shadow-2xl">Domine o Revit</h1>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl font-medium leading-relaxed hidden sm:block">
                    Continue de onde parou e aprofunde seus conhecimentos em modelagem paramétrica e coordenação de projetos executivos.
                  </p>
                  
                  <div className="w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-white">Progresso Geral</span>
                      <span className="text-lg font-black text-blue-400">{globalProgress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(searchQuery || currentTab !== 'inicio') && (
              <div className="pt-32 px-4 sm:px-6 lg:px-12 mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                  {searchQuery ? `Resultados para "${searchQuery}"` : currentTab === 'cursos' ? 'Meus Cursos em Andamento' : 'Explorar Catálogo'}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {displayModules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas encontradas.
                </p>
                <form action="/plataforma" method="GET" className="mt-4 block md:hidden relative">
                  <input type="hidden" name="tab" value="explorar" />
                  <input type="hidden" name="curso" value={activeCurso} />
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-blue-500 transition-all">
                    <SearchIcon className="h-4 w-4 text-slate-400 mr-2.5" />
                    <input 
                      type="text" 
                      name="q" 
                      defaultValue={searchQuery}
                      placeholder="Buscar aulas..." 
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                    />
                  </div>
                </form>
              </div>
            )}

            <div className={`relative z-20 px-4 sm:px-6 lg:px-12 pb-32 space-y-8 sm:space-y-12 ${currentTab === 'inicio' ? '-mt-4 sm:-mt-8' : 'mt-4 sm:mt-8'}`}>
              
              {/* CARDS SELETORES DE CURSOS RESPONSIVOS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2 border-b border-white/5">
                <Link 
                  href={`/plataforma?tab=${currentTab}&curso=arquitetura${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={`relative h-24 rounded-2xl overflow-hidden border transition-all duration-300 group/item ${
                    activeCurso === 'arquitetura' ? 'border-blue-500 shadow-lg bg-blue-950/10' : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                  }`}
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover/item:scale-110 transition-transform duration-500 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">Módulo Principal</span>
                    <h3 className="text-sm font-black text-white tracking-tight">Revit Architecture</h3>
                  </div>
                </Link>

                <Link 
                  href={`/plataforma?tab=${currentTab}&curso=mep${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={`relative h-24 rounded-2xl overflow-hidden border transition-all duration-300 group/item ${
                    planoAtual === 'basico' ? 'opacity-50' : ''
                  } ${activeCurso === 'mep' ? 'border-blue-500 shadow-lg bg-blue-950/10' : 'border-white/5 bg-white/[0.01] hover:border-white/10'}`}
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover/item:scale-110 transition-transform duration-500 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=600')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      Instalações {planoAtual === 'basico' && <Lock className="h-2.5 w-2.5" />}
                    </span>
                    <h3 className="text-sm font-black text-white tracking-tight">Revit MEP</h3>
                  </div>
                </Link>

                <Link 
                  href={`/plataforma?tab=${currentTab}&curso=estrutural${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={`relative h-24 rounded-2xl overflow-hidden border transition-all duration-300 group/item ${
                    (planoAtual === 'basico' || planoAtual === 'intermediario') ? 'opacity-50' : ''
                  } ${activeCurso === 'estrutural' ? 'border-blue-500 shadow-lg bg-blue-950/10' : 'border-white/5 bg-white/[0.01] hover:border-white/10'}`}
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover/item:scale-110 transition-transform duration-500 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      Engenharia {(planoAtual === 'basico' || planoAtual === 'intermediario') && <Lock className="h-2.5 w-2.5" />}
                    </span>
                    <h3 className="text-sm font-black text-white tracking-tight">Revit Structural</h3>
                  </div>
                </Link>
              </div>

              {/* TRAVA OU RENDERIZAÇÃO DOS MÓDULOS */}
              {!temAcessoAoCurso ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
                  <Lock className="h-10 w-10 text-amber-500 mb-3" />
                  <h2 className="text-lg font-bold text-slate-200 mb-1">Trilha Bloqueada</h2>
                  <p className="text-xs text-slate-500 max-w-sm mb-5">
                    Seu plano atual é o <span className="text-amber-500 font-semibold capitalize">{planoAtual}</span>. Faça o upgrade para destravar esta seção.
                  </p>
                  <button className="bg-blue-600 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl border border-blue-500/20 transition-all">
                    Solicitar Upgrade
                  </button>
                </div>
              ) : displayModules && displayModules.length > 0 ? (
                displayModules.map((module) => {
                  const totalInModule = module.lessons.length
                  const completedInModule = module.lessons.filter((l: any) => completedLessonIds.includes(l.id)).length

                  return (
                    <div key={module.id} className="group/row">
                      <div className="flex items-end justify-between mb-4 pr-2">
                        <h2 className="text-lg sm:text-xl font-bold text-white/90">{module.title}</h2>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {completedInModule}/{totalInModule} Aulas
                        </span>
                      </div>
                      
                      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden">
                        {module.lessons?.map((lesson: any) => {
                          const isLessonDone = completedLessonIds.includes(lesson.id)

                          return (
                            <Link 
                              href={`/plataforma/aula/${lesson.id}`} 
                              key={lesson.id}
                              className={`snap-start relative group/card transition-all duration-300 min-w-[260px] sm:min-w-[320px] max-w-[320px] ${
                                currentTab === 'explorar' || searchQuery ? 'w-full' : ''
                              }`}
                            >
                              <div className="aspect-video w-full rounded-xl overflow-hidden relative border border-white/10 shadow-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950"></div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                                  <Play className="h-8 w-8 text-white fill-white" />
                                </div>
                                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                                  {isLessonDone && <div className="bg-emerald-500 rounded-full p-0.5"><CheckCircle2 className="h-2.5 w-2.5 text-white" /></div>}
                                  <div className="bg-black/80 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider">{lesson.duration || "Aula"}</div>
                                </div>
                              </div>
                              <div className="pt-2 px-1">
                                <h3 className="font-semibold text-xs sm:text-sm text-slate-200 line-clamp-2">
                                  <span className="text-blue-500 mr-1">{lesson.order_index}.</span> {lesson.title}
                                </h3>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-16 text-slate-600 border border-dashed border-slate-800 rounded-2xl text-sm">
                  Nenhuma aula mapeada para os critérios definidos.
                </div>
              )}
            </div>
          </>
        )}

        {/* COMPONENTE DE COMUNIDADE RESPONSIVO */}
        {currentTab === 'comunidade' && (
          <div className="pt-32 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto pb-32 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Comunidade Global</h1>
                <p className="text-xs text-slate-400">Dúvidas gerais sincronizadas.</p>
              </div>
            </div>

            <div className="space-y-4">
              {communityFeed && communityFeed.length > 0 ? communityFeed.map(post => (
                <div key={post.id} className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <span className="text-xs font-bold text-blue-400 break-all">{post.user_email}</span>
                      <Link href={`/plataforma/aula/${post.lessons?.id}`} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-white mt-0.5">
                        Aula: {post.lessons?.title} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium bg-black/30 px-2.5 py-0.5 rounded-full w-fit">
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-slate-300 bg-black/20 p-3.5 rounded-xl text-xs sm:text-sm border border-white/5">
                    {post.content}
                  </p>
                  {post.admin_reply && (
                    <div className="ml-4 sm:ml-6 p-3 bg-gradient-to-r from-blue-600/10 to-transparent rounded-xl border-l-2 border-blue-500">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">Resposta do Instrutor:</span>
                      <p className="text-xs sm:text-sm text-slate-300">{post.admin_reply}</p>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-center py-10 text-xs text-slate-600">Sem registros na comunidade.</p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}