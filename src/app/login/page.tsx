import { login } from './actions'
import Link from 'next/link'
import { Layers, Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ message?: string }> 
}) {
  const resolvedParams = await searchParams
  const message = resolvedParams.message

  return (
    <div className="min-h-screen w-full flex bg-[#0B0D17] text-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ========================================== */}
      {/* LADO ESQUERDO (HERO / IMAGEM CINEMATOGRÁFICA) */}
      {/* ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transform transition-transform duration-[20s] hover:scale-100"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17]/80 via-transparent to-[#0B0D17]"></div>
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Layers className="h-10 w-10 text-blue-500" />
          <span className="font-black tracking-tighter text-2xl text-white">BIM ONE ACADEMY</span>
        </div>

        <div className="relative z-10 max-w-lg mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="h-3.5 w-3.5 fill-current" /> Acesso Exclusivo
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6 tracking-tight drop-shadow-2xl">
            A evolução do seu projeto começa <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">aqui.</span>
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed drop-shadow-md">
            Domine a modelagem paramétrica, coordenação e gestão de projetos no Revit. Entre na plataforma e continue sua jornada para o próximo nível da engenharia e arquitetura.
          </p>
          
          <div className="mt-12 flex items-center gap-4 border-t border-white/10 pt-6">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#0B0D17] bg-slate-800"></div>
              <div className="w-10 h-10 rounded-full border-2 border-[#0B0D17] bg-slate-700"></div>
              <div className="w-10 h-10 rounded-full border-2 border-[#0B0D17] bg-slate-600"></div>
            </div>
            <div className="text-sm font-medium text-slate-400">
              Junte-se a dezenas de profissionais <br/>na metodologia <span className="text-white font-bold">BIM One ACADEMY</span>.
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* LADO DIREITO (FORMULÁRIO DE LOGIN EXCLUSIVO) */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 lg:hidden">
              <Layers className="h-8 w-8 text-blue-500" />
              <span className="font-black tracking-tighter text-xl text-white">BIM ONE ACADEMY</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Bem-vindo de volta</h2>
            <p className="text-slate-400 font-medium">Acesse sua conta para continuar aprendendo.</p>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm font-bold">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* Lógica unificada na tag form para evitar interferência de múltiplos gatilhos */}
          <form action={login} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="email">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@email.com"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">
                  Senha
                </label>
                <Link href="#" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4">
              {/* Único botão do formulário configurado estritamente como submit */}
              <button 
                type="submit"
                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5"
              >
                Entrar na Plataforma
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {/* Links para Termos e Privacidade */}
          <p className="mt-10 text-center text-xs text-slate-600 font-medium">
            Ao entrar, você concorda com os <Link href="/termos" className="text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4">Termos de Serviço</Link> e a <Link href="/privacidade" className="text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4">Política de Privacidade</Link> da BIM One ACADEMY.
          </p>

        </div>
      </div>
    </div>
  )
}