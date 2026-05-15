import { createClient } from '@/lib/supabase/server'
import { 
  saveModule, deleteModule, saveLesson, deleteLesson, 
  addMaterial, deleteMaterial, replyToComment, updateAlunoProfile, deleteAlunoProfile, 
  addTransaction, deleteTransaction
} from './actions'
import { logout } from '@/app/login/actions'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, DollarSign, BookOpen, LogOut, Layers,
  PlusCircle, Video, ExternalLink, Pencil, Trash2, TrendingUp,
  FileBox, Link2, Plus, MessageSquare, Clock, Shield, User, X, 
  BarChart3, Sliders, Calendar, ArrowUpCircle, ArrowDownCircle, Filter, PlayCircle
} from 'lucide-react'

export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string, editLesson?: string, editModule?: string, manageAluno?: string, startDate?: string, endDate?: string }> 
}) {
  const resolvedParams = await searchParams
  const currentTab = resolvedParams.tab || 'dashboard'
  const editLessonId = resolvedParams.editLesson
  const editModuleId = resolvedParams.editModule
  const manageAlunoId = resolvedParams.manageAluno
  const startDate = resolvedParams.startDate || ''
  const endDate = resolvedParams.endDate || ''
  
  const supabase = await createClient()

  // 1. BUSCAS DE CONTEÚDO E ALUNOS
  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(*, lesson_materials(*))')
    .order('order_index', { ascending: true })
    .order('order_index', { foreignTable: 'lessons', ascending: true })

  const { data: lessonToEdit } = editLessonId 
    ? await supabase.from('lessons').select('*').eq('id', editLessonId).single() 
    : { data: null }

  const { data: moduleToEdit } = editModuleId 
    ? await supabase.from('modules').select('*').eq('id', editModuleId).single() 
    : { data: null }

  const { data: alunoToManage } = manageAlunoId
    ? await supabase.from('profiles').select('*').eq('id', manageAlunoId).single()
    : { data: null }

  const { count: alunosCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'aluno')

  const { data: alunos } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })

  const { data: pendingComments } = await supabase
    .from('lesson_comments')
    .select('*, lessons(title)')
    .is('admin_reply', null)
    .order('created_at', { ascending: false })

  // 2. BUSCA DINÂMICA DE TRANSAÇÕES COM FILTRO DE DATA
  let transactionQuery = supabase.from('financial_transactions').select('*').order('date', { ascending: false })
  
  if (startDate) transactionQuery = transactionQuery.gte('date', startDate)
  if (endDate) transactionQuery = transactionQuery.lte('date', endDate)
  
  const { data: transactions } = await transactionQuery

  const totalReceitas = transactions?.filter(t => t.type === 'receita').reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 0
  const totalDespesas = transactions?.filter(t => t.type === 'despesa').reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 0
  const saldoPeriodo = totalReceitas - totalDespesas

  const monthsMap = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const chartData = monthsMap.map(m => ({ month: m, receita: 0, despesa: 0 }))

  transactions?.forEach(t => {
    if (t.date) {
      const dateParts = t.date.split('-')
      if (dateParts.length === 3) {
        const monthIndex = parseInt(dateParts[1], 10) - 1
        if (monthIndex >= 0 && monthIndex < 12) {
          if (t.type === 'receita') chartData[monthIndex].receita += (Number(t.amount) || 0)
          if (t.type === 'despesa') chartData[monthIndex].despesa += (Number(t.amount) || 0)
        }
      }
    }
  })

  const maxChartValue = Math.max(...chartData.map(d => Math.max(d.receita, d.despesa)), 1000)

  const svgWidth = 1000
  const svgHeight = 340
  const paddingLeft = 110
  const paddingRight = 40
  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = 220
  const baseY = 260
  const stepX = chartWidth / 11

  const receitaPoints = chartData.map((d, i) => ({
    x: paddingLeft + i * stepX,
    y: baseY - ((d.receita / maxChartValue) * chartHeight),
    value: d.receita
  }))

  const despesaPoints = chartData.map((d, i) => ({
    x: paddingLeft + i * stepX,
    y: baseY - ((d.despesa / maxChartValue) * chartHeight),
    value: d.despesa
  }))

  const getSmoothedPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const p0 = points[i - 1] || p1
      const p3 = points[i + 2] || p2
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`
    }
    return d
  }

  const receitaPath = getSmoothedPath(receitaPoints)
  const despesaPath = getSmoothedPath(despesaPoints)

  // Corrigido aqui: trocado recePath por receitaPath de forma segura
  const receitaArea = receitaPoints.length > 0 ? `${receitaPath} L ${receitaPoints[receitaPoints.length - 1].x} ${baseY} L ${receitaPoints[0].x} ${baseY} Z` : ''
  const despesaArea = despesaPoints.length > 0 ? `${despesaPath} L ${despesaPoints[despesaPoints.length - 1].x} ${baseY} L ${despesaPoints[0].x} ${baseY} Z` : ''

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'alunos', label: 'Alunos & Suporte', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'conteudo', label: 'Cursos & Conteúdo', icon: BookOpen },
  ]

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Layers className="h-6 w-6 text-blue-500 mr-2" />
          <span className="font-bold tracking-tight text-white">BIM One Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            return (
              <Link 
                key={item.id}
                href={`/admin?tab=${item.id}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/plataforma" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">
            <ExternalLink className="h-4 w-4" />
            Ver Plataforma
          </Link>
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium text-left">
              <LogOut className="h-4 w-4" />
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-2xl font-bold capitalize">
            {navItems.find(i => i.id === currentTab)?.label}
          </h1>

          <form method="GET" action="/admin" className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-sm">
            <input type="hidden" name="tab" value={currentTab} />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input type="date" name="startDate" defaultValue={startDate} className="bg-transparent text-white focus:outline-none text-xs" />
            </div>
            <span className="text-slate-600">até</span>
            <div className="flex items-center gap-2">
              <input type="date" name="endDate" defaultValue={endDate} className="bg-transparent text-white focus:outline-none text-xs" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors">
              <Filter className="h-3.5 w-3.5" />
            </button>
            {(startDate || endDate) && (
              <Link href={`/admin?tab=${currentTab}`} className="text-xs text-red-400 hover:underline pl-1">Limpar</Link>
            )}
          </form>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
          
          {/* ========================================== */}
          {/* TAB: VISÃO GERAL */}
          {/* ========================================== */}
          {currentTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4 text-slate-400">
                    <h3 className="font-medium text-sm">Alunos Ativos</h3>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-4xl font-black text-white">{alunosCount || 0}</p>
                  <span className="text-xs text-slate-500 font-medium">Contagem real de perfis</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4 text-slate-400">
                    <h3 className="font-medium text-sm">Aulas Publicadas</h3>
                    <PlayCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-4xl font-black text-emerald-400">{totalLessons || 0}</p>
                  <span className="text-xs text-slate-500 font-medium">Total de aulas cadastradas</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4 text-slate-400">
                    <h3 className="font-medium text-sm">Dúvidas Pendentes</h3>
                    <MessageSquare className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-4xl font-black text-yellow-500">{pendingComments?.length || 0}</p>
                  <span className="text-xs text-slate-500 font-medium">Aguardando seu suporte</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4 text-slate-400">
                    <h3 className="font-medium text-sm">Saldo no Período</h3>
                    <TrendingUp className={`h-5 w-5 ${saldoPeriodo >= 0 ? 'text-blue-500' : 'text-amber-500'}`} />
                  </div>
                  <p className={`text-3xl font-black truncate ${saldoPeriodo >= 0 ? 'text-blue-400' : 'text-amber-500'}`}>
                    {saldoPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <span className="text-xs text-slate-500 font-medium">Receitas menos despesas</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col justify-between w-full">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" /> Balanço de Caixa Macroeconômico
                    </h3>
                    <p className="text-xs text-slate-400">Gráfico de linhas curvas de tendência contínua e áreas fluidas acompanhando o caixa real.</p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold bg-slate-950 px-4 py-2 rounded-xl border border-slate-800/80 h-fit">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div> Receitas</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div> Despesas</div>
                  </div>
                </div>

                <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2 md:p-4 overflow-x-auto">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[840px] overflow-visible">
                    <defs>
                      <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00"/>
                      </linearGradient>
                      <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15"/>
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.00"/>
                      </linearGradient>
                    </defs>

                    {[0, 0.5, 1].map((ratio, index) => {
                      const yPos = baseY - (ratio * chartHeight)
                      const valLabel = (ratio * maxChartValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                      return (
                        <g key={index}>
                          <line x1={paddingLeft} y1={yPos} x2={svgWidth - paddingRight} y2={yPos} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" strokeWidth="1" />
                          <text x={paddingLeft - 15} y={yPos + 4} fill="#475569" fontSize="11" fontWeight="bold" textAnchor="end" className="font-mono">{valLabel}</text>
                        </g>
                      )
                    })}

                    <path d={receitaArea} fill="url(#receitaGrad)" className="transition-all duration-500" />
                    <path d={despesaArea} fill="url(#despesaGrad)" className="transition-all duration-500" />

                    <path d={receitaPath} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]" />
                    <path d={despesaPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 drop-shadow-[0_2px_10px_rgba(244,63,94,0.25)]" />

                    {chartData.map((data, i) => {
                      const rP = receitaPoints[i]
                      const dP = despesaPoints[i]
                      return (
                        <g key={i} className="group/node">
                          <text x={rP.x} y={baseY + 25} fill="#475569" fontSize="11" fontWeight="800" textAnchor="middle" className="uppercase tracking-wider group-hover/node:fill-slate-200 transition-colors">{data.month}</text>
                          <line x1={rP.x} y1={40} x2={rP.x} y2={baseY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" className="opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none" />
                          {data.receita > 0 && <circle cx={rP.x} cy={rP.y} r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" />}
                          {data.despesa > 0 && <circle cx={dP.x} cy={dP.y} r="4" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.5" />}

                          {data.receita > 0 && (
                            <text x={rP.x} y={rP.y - 12} fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
                              {data.receita.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </text>
                          )}
                          {data.despesa > 0 && (
                            <text x={dP.x} y={dP.y + 16} fill="#fda4af" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
                              {data.despesa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB: ALUNOS & SUPORTE */}
          {/* ========================================== */}
          {currentTab === 'alunos' && (
            <div className="space-y-12">
              {alunoToManage && (
                <div className="bg-slate-900 border border-blue-500/30 p-8 rounded-3xl shadow-2xl relative backdrop-blur-md">
                  <Link href="/admin?tab=alunos" className="absolute top-6 right-6 p-2 bg-slate-950 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </Link>
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-slate-800 pb-6 mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl text-white overflow-hidden shadow-lg shrink-0">
                      {alunoToManage.avatar_url ? (
                        <img src={alunoToManage.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        alunoToManage.email?.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" /> ID do Aluno: {alunoToManage.id}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1">{alunoToManage.full_name || 'Sem nome cadastrado'}</h3>
                      <p className="text-sm text-slate-400">{alunoToManage.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <form action={updateAlunoProfile} className="md:col-span-2 space-y-4">
                      <input type="hidden" name="alunoId" value={alunoToManage.id} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome Completo</label>
                          <input type="text" name="full_name" defaultValue={alunoToManage.full_name || ''} placeholder="Nome do Aluno" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nível de Permissão</label>
                          <select name="role" defaultValue={alunoToManage.role} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all">
                            <option value="aluno">Aluno Regular</option>
                            <option value="admin">Administrador do Sistema</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plano de Acesso Comercial</label>
                          <select name="plan" defaultValue={alunoToManage.plan || 'basico'} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all">
                            <option value="basico">Plano Básico (Apenas Revit Arquitetura)</option>
                            <option value="intermediario">Plano Intermediário (Revit Arquitetura + MEP)</option>
                            <option value="avancado">Plano Avançado (Revit Arquitetura + MEP + Estrutural)</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/30">Atualizar Perfil e Plano</button>
                    </form>
                    <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2"><Trash2 className="h-4 w-4" /> Revogar Acesso</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Isso removerá permanentemente os metadados do aluno e o impedirá de acessar a plataforma BIM One.</p>
                      </div>
                      <form action={deleteAlunoProfile} className="mt-4">
                        <input type="hidden" name="alunoId" value={alunoToManage.id} />
                        <button type="submit" className="w-full bg-red-900/20 hover:bg-red-600 border border-red-700 hover:border-red-500 text-red-200 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all">Deletar Conta Permanentemente</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="text-yellow-500" /> Suporte: Dúvidas dos Alunos
                </h2>
                <div className="grid gap-6">
                  {pendingComments && pendingComments.length > 0 ? (
                    pendingComments.map(c => (
                      <div key={c.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{c.user_email}</span>
                            <h4 className="text-sm font-medium text-slate-500 mt-1">Na aula: {c.lessons?.title}</h4>
                          </div>
                          <span className="text-[10px] text-slate-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-200 bg-black/30 p-4 rounded-xl mb-6 italic border-l-2 border-slate-700">"{c.content}"</p>
                        <form action={replyToComment} className="flex gap-4">
                          <input type="hidden" name="commentId" value={c.id} />
                          <input name="reply" placeholder="Escreva sua resposta técnica aqui..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all text-white" required />
                          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold text-sm transition-colors text-white">Responder</button>
                        </form>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-10 border border-dashed border-slate-800 rounded-2xl">Não há dúvidas pendentes no momento. Bom trabalho!</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Users className="text-blue-500" /> Usuários da Plataforma
                </h2>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">E-mail</th>
                        <th className="px-6 py-4">Nível</th>
                        <th className="px-6 py-4">Plano Atual</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {alunos?.map(aluno => (
                        <tr key={aluno.id} className={`hover:bg-slate-800/30 transition-colors ${aluno.id === manageAlunoId ? 'bg-blue-600/5' : ''}`}>
                          <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-xs text-slate-400">
                              {aluno.avatar_url ? <img src={aluno.avatar_url} className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
                            </div>
                            {aluno.full_name || <span className="text-slate-600 font-normal italic">Não preenchido</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{aluno.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${aluno.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-blue-400 border border-blue-500/20'}`}>
                              {aluno.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${aluno.plan === 'avancado' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : aluno.plan === 'intermediario' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/20 text-slate-400'}`}>
                              {aluno.plan || 'basico'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/admin?tab=alunos&manageAluno=${aluno.id}`} className="inline-flex items-center bg-slate-950 hover:bg-blue-600 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 hover:border-blue-500 transition-all shadow-md">Gerenciar</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB: FINANCEIRO */}
          {/* ========================================== */}
          {currentTab === 'financeiro' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-150">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-blue-500" /> Nova Movimentação
                </h3>
                <p className="text-xs text-slate-400 mb-6">Insira um novo registro individual de débito ou crédito no livro de caixa.</p>

                <form action={addTransaction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição / Origem</label>
                    <input type="text" name="description" placeholder="Ex: Venda Plano Avançado #88" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor (R$)</label>
                      <input type="number" step="0.01" name="amount" placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none font-mono" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo</label>
                      <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" required>
                        <option value="receita">Receita (+)</option>
                        <option value="despesa">Despesa (-)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data do Lançamento</label>
                    <input type="date" name="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" required />
                  </div>
                  
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Lançar em Caixa
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-500" /> Extrato de Lançamentos
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">Histórico detalhado de movimentações encontradas para o intervalo configurado.</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl overflow-hidden overflow-y-auto max-h-[420px]">
                  {transactions && transactions.length > 0 ? (
                    <div className="divide-y divide-slate-800/60">
                      {transactions.map((t) => (
                        <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors text-sm">
                          <div className="flex items-center gap-4">
                            {t.type === 'receita' ? (
                              <ArrowUpCircle className="h-8 w-8 text-emerald-500/20 bg-emerald-500/10 rounded-full p-1" />
                            ) : (
                              <ArrowDownCircle className="h-8 w-8 text-rose-500/20 bg-rose-500/10 rounded-full p-1" />
                            )}
                            <div>
                              <p className="font-bold text-white">{t.description}</p>
                              <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <span className={`font-mono font-bold text-base ${t.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {t.type === 'receita' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <form action={async () => { 'use server'; await deleteTransaction(t.id); }}>
                              <button type="submit" className="text-slate-600 hover:text-red-400 p-1 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500 text-sm border-2 border-dashed border-slate-900 rounded-2xl">
                      Nenhuma transação lançada para este período.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB: CONTEÚDO (EDITAR E CADASTRAR) */}
          {/* ========================================== */}
          {currentTab === 'conteudo' && (
            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* FORMULÁRIO MÓDULO */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    {moduleToEdit ? <Pencil className="h-5 w-5 text-yellow-500" /> : <PlusCircle className="h-5 w-5 text-emerald-500" />}
                    {moduleToEdit ? 'Editar Módulo' : 'Novo Módulo'}
                  </h2>
                  <form action={saveModule} className="space-y-4">
                    <input type="hidden" name="id" value={moduleToEdit?.id || ''} />
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título do Módulo</label>
                      <input name="title" defaultValue={moduleToEdit?.title || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="Ex: Fundamentos da Modelagem" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ordem</label>
                        <input name="order_index" type="number" defaultValue={moduleToEdit?.order_index || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="Ex: 1" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Curso Vinculado</label>
                        <select name="category" defaultValue={moduleToEdit?.category || 'arquitetura'} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm outline-none focus:border-blue-500">
                          <option value="arquitetura">Revit Arquitetura</option>
                          <option value="mep">Revit MEP</option>
                          <option value="estrutural">Revit Estrutural</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-all text-white text-sm">Salvar Módulo</button>
                      {moduleToEdit && <Link href="/admin?tab=conteudo" className="bg-slate-800 px-4 py-3 rounded-lg text-sm flex items-center justify-center text-white">Cancelar</Link>}
                    </div>
                  </form>
                </div>

                {/* FORMULÁRIO AULA ADAPTADO COM A CATEGORIA DO CURSO */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    {lessonToEdit ? <Pencil className="h-5 w-5 text-yellow-500" /> : <Video className="h-5 w-5 text-blue-500" />}
                    {lessonToEdit ? 'Editar Aula' : 'Nova Aula'}
                  </h2>
                  <form action={saveLesson} className="space-y-4">
                    <input type="hidden" name="id" value={lessonToEdit?.id || ''} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Módulo Pertencente</label>
                        <select name="module_id" defaultValue={lessonToEdit?.module_id || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" required>
                          <option value="">Selecionar Módulo...</option>
                          {modules?.map(m => <option key={m.id} value={m.id}>{m.title} ({m.category})</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Classificação de Curso</label>
                        <select name="category" defaultValue={lessonToEdit?.category || 'arquitetura'} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm outline-none focus:border-blue-500">
                          <option value="arquitetura">Revit Arquitetura</option>
                          <option value="mep">Revit MEP</option>
                          <option value="estrutural">Revit Estrutural</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título da Aula</label>
                      <input name="title" defaultValue={lessonToEdit?.title || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="Ex: Configuração de Famílias Paramétricas" required />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição Técnica</label>
                      <textarea name="description" defaultValue={lessonToEdit?.description || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm min-h-[80px]" placeholder="Descrição dos tópicos abordados no vídeo..."></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Link do YouTube</label>
                      <input name="video_url" defaultValue={lessonToEdit?.video_url || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="https://www.youtube.com/watch?v=..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duração</label>
                        <input name="duration" defaultValue={lessonToEdit?.duration || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="Ex: 14:25" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Indexador de Ordem</label>
                        <input name="order_index" type="number" defaultValue={lessonToEdit?.order_index || ''} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="Ex: 1" required />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold transition-all text-white text-sm">Salvar Estrutura da Aula</button>
                      {lessonToEdit && <Link href="/admin?tab=conteudo" className="bg-slate-800 px-4 py-3 rounded-lg text-sm flex items-center justify-center text-white">Cancelar</Link>}
                    </div>
                  </form>
                </div>
              </div>

              {/* LISTA DE GESTÃO COM BADGES EXPLICITAS PARA MÓDULOS E AULAS */}
              <div className="space-y-6 pt-4">
                <h2 className="text-xl font-bold border-b border-slate-800 pb-4">Estrutura Atual de Cursos</h2>
                {modules?.map(module => (
                  <div key={module.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs">{module.order_index}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xl">{module.title}</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${module.category === 'estrutural' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : module.category === 'mep' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                              Mód: {module.category === 'estrutural' ? 'Estrutural' : module.category === 'mep' ? 'MEP' : 'Arquitetura'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin?tab=conteudo&editModule=${module.id}`} className="p-2.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-yellow-500 transition-colors"><Pencil className="h-4 w-4" /></Link>
                        <form action={async () => { 'use server'; await deleteModule(module.id); }}>
                          <button className="p-2.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </form>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {module.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="flex flex-col bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
                          <div className="flex justify-between items-center p-4 group">
                            
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-slate-300 font-medium">{lesson.order_index}. {lesson.title}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${lesson.category === 'estrutural' ? 'bg-indigo-500/15 text-indigo-400' : lesson.category === 'mep' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                                {lesson.category || 'arquitetura'}
                              </span>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/admin?tab=conteudo&editLesson=${lesson.id}`} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-yellow-500"><Pencil className="h-4 w-4" /></Link>
                              <form action={async () => { 'use server'; await deleteLesson(lesson.id); }}>
                                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                              </form>
                            </div>
                          </div>

                          <div className="p-4 bg-black/40 border-t border-slate-800/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><FileBox className="h-4 w-4" /> Materiais da Aula</h4>
                            {lesson.lesson_materials && lesson.lesson_materials.length > 0 && (
                              <div className="space-y-2 mb-4">
                                {lesson.lesson_materials.map((mat: any) => (
                                  <div key={mat.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm">
                                    <div className="flex items-center gap-2 text-slate-300">
                                      <Link2 className="h-4 w-4 text-blue-500" />
                                      <span className="truncate max-w-[200px]">{mat.title}</span>
                                    </div>
                                    <form action={async () => { 'use server'; await deleteMaterial(mat.id); }}>
                                      <button className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="h-4 w-4" /></button>
                                    </form>
                                  </div>
                                ))}
                              </div>
                            )}

                            <form action={addMaterial} className="flex gap-2">
                              <input type="hidden" name="lesson_id" value={lesson.id} />
                              <input name="title" placeholder="Nome do Arquivo" className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" required />
                              <input name="url" placeholder="Link (Drive, Dropbox...)" className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" required />
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"><Plus className="h-4 w-4" /> Anexar</button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}