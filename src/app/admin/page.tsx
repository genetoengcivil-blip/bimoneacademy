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
  BarChart3, Sliders, Calendar, ArrowUpCircle, ArrowDownCircle, Filter, PlayCircle, Menu
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

  const receitaArea = receitaPoints.length > 0 ? `${receitaPath} L ${receitaPoints[receitaPoints.length - 1].x} ${baseY} L ${receitaPoints[0].x} ${baseY} Z` : ''
  const despesaArea = despesaPoints.length > 0 ? `${despesaPath} L ${despesaPoints[despesaPoints.length - 1].x} ${baseY} L ${despesaPoints[0].x} ${baseY} Z` : ''

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'alunos', label: 'Alunos & Suporte', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'conteudo', label: 'Cursos & Conteúdo', icon: BookOpen },
  ]

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden relative">
      
      {/* CHECKBOX OCULTO PARA CONTROLE DO MENU MOBILE ADMIN */}
      <input type="checkbox" id="admin-menu" className="peer/admin hidden" />
      
      {/* OVERLAY ESCURO MOBILE */}
      <label 
        htmlFor="admin-menu" 
        className="fixed inset-0 bg-black/80 z-[55] hidden peer-checked/admin:block lg:hidden backdrop-blur-sm transition-opacity cursor-pointer"
      ></label>

      {/* SIDEBAR ADMINISTRATIVA RETRÁTIL */}
      <aside className="fixed lg:relative top-0 left-0 h-full z-[60] w-64 -translate-x-full peer-checked/admin:translate-x-0 lg:translate-x-0 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300">
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <Layers className="h-6 w-6 text-blue-500 mr-2" />
            <span className="font-bold tracking-tight text-white">BIM One Admin</span>
          </div>
          <label htmlFor="admin-menu" className="p-2 bg-slate-950 rounded-xl text-white lg:hidden cursor-pointer hover:bg-slate-800">
            <X className="h-4 w-4" />
          </label>
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

      {/* ÁREA CENTRAL PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <header className="h-20 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 gap-4">
          
          <div className="flex items-center gap-3">
            <label htmlFor="admin-menu" className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-white cursor-pointer lg:hidden flex items-center justify-center">
              <Menu className="h-5 w-5" />
            </label>
            <h1 className="text-lg sm:text-2xl font-bold capitalize truncate">
              {navItems.find(i => i.id === currentTab)?.label}
            </h1>
          </div>

          <form method="GET" action="/admin" className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs sm:text-sm">
            <input type="hidden" name="tab" value={currentTab} />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500 hidden sm:block" />
              <input type="date" name="startDate" defaultValue={startDate} className="bg-transparent text-white focus:outline-none text-[10px] sm:text-xs w-20 sm:w-auto" />
            </div>
            <span className="text-slate-600 text-[10px] sm:text-xs">al</span>
            <div className="flex items-center gap-1.5">
              <input type="date" name="endDate" defaultValue={endDate} className="bg-transparent text-white focus:outline-none text-[10px] sm:text-xs w-20 sm:w-auto" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-lg transition-colors">
              <Filter className="h-3 w-3" />
            </button>
          </form>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
          
          {/* TAB: VISÃO GERAL */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <h3 className="font-medium text-xs sm:text-sm">Alunos Ativos</h3>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-white">{alunosCount || 0}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <h3 className="font-medium text-xs sm:text-sm">Aulas Publicadas</h3>
                    <PlayCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400">{totalLessons || 0}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <h3 className="font-medium text-xs sm:text-sm">Dúvidas Pendentes</h3>
                    <MessageSquare className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-yellow-500">{pendingComments?.length || 0}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <h3 className="font-medium text-xs sm:text-sm">Saldo no Período</h3>
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-blue-400 truncate">
                    {saldoPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* GRÁFICO BLINDADO COM SCROLL HORIZONTAL */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl flex flex-col justify-between w-full">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" /> Fluxo de Caixa Continuo
                    </h3>
                  </div>
                </div>

                <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2 overflow-x-auto">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[760px] overflow-visible">
                    <defs>
                      <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                      </linearGradient>
                      <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {[0, 0.5, 1].map((ratio, index) => (
                      <line key={index} x1={paddingLeft} y1={baseY - (ratio * chartHeight)} x2={svgWidth - paddingRight} y2={baseY - (ratio * chartHeight)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    ))}
                    <path d={receitaArea} fill="url(#receitaGrad)" />
                    <path d={despesaArea} fill="url(#despesaGrad)" />
                    <path d={receitaPath} fill="none" stroke="#3b82f6" strokeWidth="3" />
                    <path d={despesaPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                    {chartData.map((data, i) => (
                      <g key={i}>
                        <text x={receitaPoints[i].x} y={baseY + 22} fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">{data.month}</text>
                        {data.receita > 0 && <circle cx={receitaPoints[i].x} cy={receitaPoints[i].y} r="4" fill="#3b82f6" />}
                        {data.despesa > 0 && <circle cx={despesaPoints[i].x} cy={despesaPoints[i].y} r="3.5" fill="#f43f5e" />}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ALUNOS & SUPORTE */}
          {currentTab === 'alunos' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              
              {/* SUITE DE SUPORTE PENDENTE */}
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2"><MessageSquare className="text-yellow-500 h-5 w-5" /> Dúvidas do Suporte</h2>
                {pendingComments && pendingComments.length > 0 ? pendingComments.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-4">
                    <p className="text-xs text-blue-400 font-bold">{c.user_email} em {c.lessons?.title}</p>
                    <p className="text-xs sm:text-sm text-slate-300 bg-slate-950 p-3 rounded-xl">"{c.content}"</p>
                    <form action={replyToComment} className="flex flex-col sm:flex-row gap-2">
                      <input type="hidden" name="commentId" value={c.id} />
                      <input name="reply" placeholder="Sua resposta técnica..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white" required />
                      <button className="bg-blue-600 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shrink-0">Responder</button>
                    </form>
                  </div>
                )) : <p className="text-xs text-slate-600 italic">Sem dúvidas pendentes.</p>}
              </section>

              {/* TABELA DE ALUNOS COM ROLAGEM HORIZONTAL MÓVEL BLINDADA */}
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2"><Users className="text-blue-500 h-5 w-5" /> Alunos Matriculados</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl w-full">
                  <div className="overflow-x-auto block w-full">
                    <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3 sm:px-6 sm:py-4">Nome</th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4">E-mail</th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4">Plano</th>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {alunos?.map(aluno => (
                          <tr key={aluno.id} className="hover:bg-slate-800/20">
                            <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-white truncate max-w-[160px]">{aluno.full_name || 'Sem nome'}</td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-300 truncate max-w-[200px]">{aluno.email}</td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 capitalize text-blue-400 font-medium">{aluno.plan || 'basico'}</td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                              <Link href={`/admin?tab=alunos&manageAluno=${aluno.id}`} className="bg-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-800 text-slate-300">Gerenciar</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB: FINANCEIRO */}
          {currentTab === 'financeiro' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-150">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 h-fit">
                <h3 className="text-base font-bold text-white mb-4">Novo Lançamento</h3>
                <form action={addTransaction} className="space-y-4">
                  <input type="text" name="description" placeholder="Descrição do Item" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" step="0.01" name="amount" placeholder="Valor (R$)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                    <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white">
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                    </select>
                  </div>
                  <input type="date" name="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs sm:text-sm">Lançar Caixa</button>
                </form>
              </div>

              {/* LISTA DE EXTRATO FINANCEIRO COMPACTO */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Extrato Consolidado</h3>
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl max-h-[360px] overflow-y-auto divide-y divide-slate-800/60">
                  {transactions && transactions.length > 0 ? transactions.map(t => (
                    <div key={t.id} className="p-3.5 flex items-center justify-between text-xs sm:text-sm gap-2">
                      <div className="truncate">
                        <p className="font-bold text-white truncate max-w-[180px] sm:max-w-none">{t.description}</p>
                        <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                      </div>
                      <span className={`font-mono font-bold ${t.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )) : <p className="p-8 text-center text-xs text-slate-600">Sem registros lançados.</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTEÚDO */}
          {currentTab === 'conteudo' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* BLOCOR DE CADASTRO RAPIDO DE MÓDULOS */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Gerenciar Módulo</h3>
                  <form action={saveModule} className="space-y-3">
                    <input type="hidden" name="id" value={moduleToEdit?.id || ''} />
                    <input name="title" defaultValue={moduleToEdit?.title || ''} placeholder="Nome do Módulo" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                    <div className="grid grid-cols-2 gap-2">
                      <input name="order_index" type="number" defaultValue={moduleToEdit?.order_index || ''} placeholder="Índice" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                      <select name="category" defaultValue={moduleToEdit?.category || 'arquitetura'} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white">
                        <option value="arquitetura">Arquitetura</option>
                        <option value="mep">MEP</option>
                        <option value="estrutural">Estrutural</option>
                      </select>
                    </div>
                    <button className="w-full bg-blue-600 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white">Salvar Módulo</button>
                  </form>
                </div>

                {/* BLOCO DE CADASTRO RAPIDO DE AULAS */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Gerenciar Aula</h3>
                  <form action={saveLesson} className="space-y-3">
                    <input type="hidden" name="id" value={lessonToEdit?.id || ''} />
                    <div className="grid grid-cols-2 gap-2">
                      <select name="module_id" defaultValue={lessonToEdit?.module_id || ''} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required>
                        <option value="">Módulo...</option>
                        {modules?.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                      </select>
                      <select name="category" defaultValue={lessonToEdit?.category || 'arquitetura'} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white">
                        <option value="arquitetura">Arquitetura</option>
                        <option value="mep">MEP</option>
                        <option value="estrutural">Estrutural</option>
                      </select>
                    </div>
                    <input name="title" defaultValue={lessonToEdit?.title || ''} placeholder="Título da Aula" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                    <input name="video_url" defaultValue={lessonToEdit?.video_url || ''} placeholder="Link Completo YouTube" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                    <div className="grid grid-cols-2 gap-2">
                      <input name="duration" defaultValue={lessonToEdit?.duration || ''} placeholder="Ex: 12:40" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" />
                      <input name="order_index" type="number" defaultValue={lessonToEdit?.order_index || ''} placeholder="Ordem" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white" required />
                    </div>
                    <button className="w-full bg-emerald-600 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white">Salvar Aula</button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}