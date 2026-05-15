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

  // Coleta estendida dos metadados do aluno (Nome e Plano Comercial)
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

  // VALIDAÇÃO DE ACESSO DO ALUNO AO CURSO FILTRADO
  let temAcessoAoCurso = false
  if (activeCurso === 'arquitetura') {
    temAcessoAoCurso = true
  } else if (activeCurso === 'mep') {
    temAcessoAoCurso = planoAtual === 'intermediario' || planoAtual === 'avancado'
  } else if (activeCurso === 'estrutural') {
    temAcessoAoCurso = planoAtual === 'avancado'
  }

  // Distribuição dos módulos de acordo com a aba de curso ativa
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

  // Mapeamento estético de rótulos dos planos
  const planLabels: { [key: string]: { label: string, color: string } } = {
    basico: { label: 'Plano Básico', color: 'text-slate-400 bg-white/5 border-white/5' },
    intermediario: { label: 'Plano Intermediário', color: 'text-amber-400 bg-amber-500/10 border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.05)]' },
    avancado: { label: 'Plano Avançado Premium', color: 'text-blue-400 bg-blue-500/10 border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' }
  }

  return (
    <div className="flex h-screen bg-[#0B0D17] text-slate-50 font-sans overflow-hidden selection:bg-blue-600 selection:text-white relative">
      
      {/* CHECKBOX OCULTO PARA CONTROLE DO MENU MOBILE (CSS-Only) */}
      <input type="checkbox" id="mobile-menu" className="peer/menu hidden" />
      
      {/* OVERLAY ESCURO PARA MOBILE (Clica fora para fechar) */}
      <label 
        htmlFor="mobile-menu" 
        className="fixed inset-0 bg-black/80 z-[55] hidden peer-checked/menu:block lg:hidden backdrop-blur-sm transition-opacity cursor-pointer"
      ></label>

      {/* ========================================== */}
      {/* SIDEBAR LATERAL (RESPONSIVA) */}
      {/* ========================================== */}
      <aside className="fixed lg:relative top-0 left-0 h-full z-[60] w-64 lg:w-20 xl:w-64 -translate-x-full peer-checked/menu:translate-x-0 lg:translate-x-0 bg-black/90 lg:bg-black/50 border-r border-white/5 flex flex-col shrink-0 transition-transform duration-300 backdrop-blur-xl">
        
        {/* Botão de Fechar no Mobile */}
        <label htmlFor="mobile-menu" className="absolute top-6 right-4 p-2 bg-white/10 rounded-xl text-white lg:hidden cursor-pointer hover:bg-white/20 transition-colors">
          <X className="h-5 w-5" />
        </label>

        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
          <Layers className="h-8 w-8 text-blue-500 shrink-0" />
          <span className="font-extrabold tracking-tighter text-xl text-white ml-3 block lg:hidden xl:block">
            BIM ONE
          </span>
        </div>
        
        <nav className="flex-1 py-8 flex flex-col gap-2 px-3 lg:px-4 overflow-y-auto scrollbar-hide">
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

        <div className="p-3 lg:p-4 border-t border-white/5 flex flex-col gap-2 bg-black/20 lg:bg-transparent">
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
              <Settings className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-sm block lg:hidden xl:block">Painel Admin</span>
            </Link>
          )}
          <form action={logout}>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm block lg:hidden xl:block">Sair</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ========================================== */}
      {/* ÁREA PRINCIPAL DA PLATAFORMA */}
      {/* ========================================== */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[#0B0D17]">
        
        {/* HEADER TOP RESPONSIVO */}
        <header className="absolute top-0 w-full z-40 h-24 flex items-center justify-between px-6 lg:px-12 bg-gradient-to-b from-black/90 lg:from-black/80 to-transparent pointer-events-none">
          
          {/* Botão Hamburger (Aparece só no Mobile) */}
          <div className="pointer-events-auto lg:hidden">
            <label htmlFor="mobile-menu" className="p-2 bg-white/5 border border-white/10 rounded-xl text-white cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center backdrop-blur-md">
              <Menu className="h-6 w-6" />
            </label>
          </div>

          {/* Lado Direito (Busca, Notificações e o Card do Aluno Ampliado) */}
          <div className="flex items-center gap-4 lg:gap-6 pointer-events-auto ml-auto">
            
            <form action="/plataforma" method="GET" className="relative group hidden sm:block">
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
              
              <div className="absolute right-[-60px] lg:right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl hidden group-hover:block overflow-hidden z-50">
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

            {/* CARD DE PERFIL AVANÇADO UNIFICADO */}
            <Link 
              href="/plataforma/perfil" 
              className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/40 rounded-2xl p-2 pr-4 transition-all duration-300 group/prof backdrop-blur-md relative shadow-2xl overflow-hidden shadow-black/60"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover/prof:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm border border-white/10 overflow-hidden shrink-0 group-hover/prof:scale-105 transition-transform duration-300">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.email?.substring(0, 2).toUpperCase()
                )}
              </div>

              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-slate-200 group-hover/prof:text-white transition-colors">{alunoNome}</span>
                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 mt-1 rounded border transition-all ${planLabels[planoAtual]?.color}`}>
                  {planLabels[planoAtual]?.label}
                </span>
              </div>
            </Link>

          </div>
        </header>

        {/* ========================================== */}
        {/* ABA: INÍCIO E EXPLORAR */}
        {/* ========================================== */}
        {(currentTab === 'inicio' || currentTab === 'explorar' || currentTab === 'cursos') && (
          <>
            {!searchQuery && currentTab === 'inicio' && (
              <section className="relative w-full h-[60vh] min-h-[500px] flex items-end pb-24 px-6 lg:px-12 pt-32 lg:pt-0">
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-900 via-blue-900/20 to-slate-900 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-2 text-blue-400 font-bold tracking-widest text-xs uppercase mb-4">
                    <Award className="h-4 w-4" /> Jornada BIM One
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-4 tracking-tight drop-shadow-2xl">Domine o Revit</h1>
                  <p className="text-base lg:text-lg text-slate-300 mb-8 max-w-xl font-medium drop-shadow-md leading-relaxed hidden sm:block">
                    Continue de onde parou e aprofunde seus conhecimentos em modelagem paramétrica e coordenação de projetos executivos.
                  </p>
                  
                  <div className="w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-semibold text-white">Progresso Geral</span>
                      <span className="text-xl font-black text-blue-400">{globalProgress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${globalProgress}%` }}></div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(searchQuery || currentTab !== 'inicio') && (
              <div className="pt-32 px-6 lg:px-12 mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                  {searchQuery ? `Resultados para "${searchQuery}"` : currentTab === 'cursos' ? 'Meus Cursos em Andamento' : 'Explorar Catálogo'}
                </h1>
                <p className="text-slate-400 text-sm lg:text-base">
                  {displayModules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas encontradas.
                </p>
                <form action="/plataforma" method="GET" className="mt-6 block sm:hidden relative">
                  <input type="hidden" name="tab" value="explorar" />
                  <input type="hidden" name="curso" value={activeCurso} />
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white/10 transition-all">
                    <SearchIcon className="h-5 w-5 text-slate-400 mr-3" />
                    <input 
                      type="text" 
                      name="q" 
                      defaultValue={searchQuery}
                      placeholder="Buscar aulas..." 
                      className="bg-transparent border-none outline-none text-base text-white w-full"
                    />
                  </div>
                </form>
              </div>
            )}

            <div className={`relative z-20 px-6 lg:px-12 pb-32 space-y-12 lg:space-y-16 ${currentTab === 'inicio' ? '-mt-8' : 'mt-8'}`}>
              
              {/* NOVO: SELEÇÃO DOS 3 CURSOS EM CARDS AVANÇADOS COM IMAGEM E PARALLAX EFFECT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-4 border-b border-white/5">
                
                {/* CARD 1: ARQUITETURA */}
                <Link 
                  href={`/plataforma?tab=${currentTab}&curso=arquitetura${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={`relative h-28 rounded-2xl overflow-hidden border transition-all duration-300 group/item snap-start ${
                    activeCurso === 'arquitetura'
                      ? 'border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.25)] bg-blue-950/20'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-25 group-hover/item:opacity-40 group-hover/item:scale-110 transition-all duration-500 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">Módulo Principal</span>
                    <h3 className="text-base font-black text-white tracking-tight">Revit Arquitetura</h3>
                  </div>
                </Link>

                {/* CARD 2: MEP */}
                <Link 
                  href={`/plataforma?tab=${currentTab}&curso=mep${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={`relative h-28 rounded-2xl overflow-hidden border transition-all duration-300 group/item snap-start ${
                    planoAtual === 'basico' ? 'opacity-50 hover:opacity-70' : ''
                  } ${
                    activeCurso === 'mep'
                      ? 'border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.25)] bg-blue-950/20'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-25 group-hover/item:opacity-40 group-hover/item:scale-110 transition-all duration-500 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=600')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      Instalações {planoAtual === 'basico' && <Lock className="h-3 w-3" />}
                    </span>
                    <h3 className="text-base font-black text-white tracking-tight">Revit MEP</h3>
                  </div>
                </Link>

                {/* CARD 3: ESTRUTURAL */}
                <Link 
                  href={`/plataforma?tab=${currentTab}&curso=estrutural${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={`relative h-28 rounded-2xl overflow-hidden border transition-all duration-300 group/item snap-start ${
                    (planoAtual === 'basico' || planoAtual === 'intermediario') ? 'opacity-50 hover:opacity-70' : ''
                  } ${
                    activeCurso === 'estrutural'
                      ? 'border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.25)] bg-blue-950/20'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-25 group-hover/item:opacity-40 group-hover/item:scale-110 transition-all duration-500 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      Cálculo & Engenharia {(planoAtual === 'basico' || planoAtual === 'intermediario') && <Lock className="h-3 w-3" />}
                    </span>
                    <h3 className="text-base font-black text-white tracking-tight">Revit Estrutural</h3>
                  </div>
                </Link>

              </div>

              {/* VALIDAÇÃO DE CONTEÚDO BLOQUEADO OU LIBERADO */}
              {!temAcessoAoCurso ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                  <Lock className="h-12 w-12 text-amber-500 mb-4 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]" />
                  <h2 className="text-xl font-bold text-slate-200 mb-2">Trilha de Aprendizado Bloqueada</h2>
                  <p className="text-sm text-slate-500 max-w-md px-4 mb-6">
                    Esta seção exige o plano <span className="text-blue-400 font-semibold capitalize">{activeCurso === 'mep' ? 'Intermediário' : 'Avançado'}</span>. Seu nível contratado atual é o <span className="text-amber-500 font-semibold capitalize">{planoAtual}</span>.
                  </p>
                  <button className="bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl border border-blue-500/30 transition-all shadow-lg">
                    Falar com o Suporte para Upgrade
                  </button>
                </div>
              ) : displayModules && displayModules.length > 0 ? (
                displayModules.map((module) => {
                  const totalInModule = module.lessons.length
                  const completedInModule = module.lessons.filter((l: any) => completedLessonIds.includes(l.id)).length
                  const modulePercent = totalInModule > 0 ? Math.round((completedInModule / totalInModule) * 100) : 0

                  return (
                    <div key={module.id} className="group/row">
                      <div className="flex items-end justify-between mb-4 pr-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-white/90 group-hover/row:text-white transition-colors">{module.title}</h2>
                        <div className="hidden sm:flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span>{completedInModule}/{totalInModule} Aulas</span>
                          {modulePercent === 100 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                      </div>
                      
                      <div className={`flex gap-4 overflow-x-auto pb-8 pt-4 -mt-4 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden ${currentTab === 'explorar' || searchQuery ? 'flex-wrap' : ''}`}>
                        {module.lessons?.map((lesson: any) => {
                          const isLessonDone = completedLessonIds.includes(lesson.id)

                          return (
                            <Link 
                              href={`/plataforma/aula/${lesson.id}`} 
                              key={lesson.id}
                              className={`snap-start relative group/card transition-all duration-300 hover:z-30 hover:scale-105 ${currentTab === 'explorar' || searchQuery ? 'w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)]' : 'min-w-[280px] md:min-w-[340px] max-w-[340px]'}`}
                            >
                              <div className={`aspect-video w-full rounded-xl overflow-hidden relative border transition-all duration-300 ${isLessonDone ? 'border-white/5 opacity-70 hover:opacity-100' : 'border-white/10 shadow-xl'}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950"></div>
                                <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors duration-300"></div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform scale-75 group-hover/card:scale-100">
                                  <div className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30 shadow-2xl"><Play className="h-8 w-8 text-white fill-white" /></div>
                                </div>
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                  {isLessonDone && <div className="bg-emerald-500/90 backdrop-blur-sm rounded-full p-1 shadow-lg"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                                  <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">{lesson.duration || "Aula"}</div>
                                </div>
                                {isLessonDone && <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full"></div>}
                              </div>
                              <div className="pt-3 px-1">
                                <h3 className={`font-semibold text-sm leading-snug line-clamp-2 transition-colors ${isLessonDone ? "text-slate-400" : "text-slate-200 group-hover/card:text-white"}`}>
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
                <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-center border border-white/5 rounded-3xl bg-white/[0.02] mx-2 lg:mx-0">
                  <SearchIcon className="h-12 w-12 lg:h-16 lg:w-16 text-slate-700 mb-4" />
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-300 mb-2">Nenhum conteúdo encontrado</h2>
                  <p className="text-sm lg:text-base text-slate-500 max-w-md px-4">Não encontramos resultados para a sua busca ou você ainda não iniciou nenhum curso.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* ABA: COMUNIDADE GLOBAL (Fórum) */}
        {/* ========================================== */}
        {currentTab === 'comunidade' && (
          <div className="pt-24 lg:pt-32 px-6 lg:px-12 max-w-5xl mx-auto pb-32">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 w-fit">
                <MessageSquare className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Comunidade BIM One</h1>
                <p className="text-sm lg:text-base text-slate-400">Acompanhe as dúvidas e discussões de todos os alunos da plataforma.</p>
              </div>
            </div>

            <div className="space-y-6">
              {communityFeed && communityFeed.length > 0 ? communityFeed.map(post => (
                <div key={post.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 backdrop-blur-sm shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <span className="text-xs lg:text-sm font-black text-blue-400 uppercase tracking-widest break-all">{post.user_email}</span>
                      <Link href={`/plataforma/aula/${post.lessons?.id}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors mt-1">
                        Aula: {post.lessons?.title} <ArrowRight className="h-3 w-3 shrink-0" />
                      </Link>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold bg-black/40 px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                      <Clock className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-slate-200 bg-black/20 p-4 lg:p-5 rounded-2xl mb-2 text-sm leading-relaxed border border-white/5">
                    {post.content}
                  </p>

                  {post.admin_reply && (
                    <div className="mt-4 ml-4 lg:ml-12 p-4 lg:p-5 bg-gradient-to-r from-blue-600/10 to-transparent rounded-2xl border border-blue-500/20 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">Instrutor BIM One respondeu:</span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{post.admin_reply}</p>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
                  <MessageCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 px-4">A comunidade ainda está silenciosa. Seja o primeiro a fazer uma pergunta nas aulas!</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}