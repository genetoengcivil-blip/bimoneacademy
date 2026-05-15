import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { updatePassword, updateProfile } from './actions'
import { 
  Layers, LogOut, Home, Compass, MessageCircle, Settings, 
  BookOpen, User, Shield, Mail, Key, Award, Calendar
} from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'AL'
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Recente'
  
  const displayName = profile?.full_name || 'Aluno BIM One'
  const displayAvatar = profile?.avatar_url

  return (
    <div className="flex h-screen bg-[#0B0D17] text-slate-50 font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* SIDEBAR LATERAL */}
      <aside className="w-20 lg:w-64 bg-black/50 border-r border-white/5 flex flex-col shrink-0 transition-all duration-300 z-50 backdrop-blur-xl">
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
          <Layers className="h-8 w-8 text-blue-500 shrink-0" />
          <span className="font-extrabold tracking-tighter text-xl text-white ml-3 hidden lg:block">BIM ONE</span>
        </div>
        
        <nav className="flex-1 py-8 flex flex-col gap-2 px-3 lg:px-4">
          <Link href="/plataforma" className="flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
            <Home className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium hidden lg:block">Início</span>
          </Link>
          <Link href="/plataforma" className="flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
            <Compass className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium hidden lg:block">Explorar</span>
          </Link>
          <Link href="/plataforma" className="flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
            <BookOpen className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium hidden lg:block">Meus Cursos</span>
          </Link>
          <Link href="/plataforma" className="flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
            <MessageCircle className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium hidden lg:block">Comunidade</span>
          </Link>
          <Link href="/plataforma/perfil" className="flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border-l-2 border-blue-500 transition-all group mt-4">
            <User className="h-5 w-5 shrink-0" />
            <span className="font-semibold hidden lg:block">Meu Perfil</span>
          </Link>
        </nav>

        <div className="p-3 lg:p-4 border-t border-white/5 flex flex-col gap-2">
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-4 px-3 lg:px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
              <Settings className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-sm hidden lg:block">Painel Admin</span>
            </Link>
          )}
          <form action={logout}>
            <button className="w-full flex items-center gap-4 px-3 lg:px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm hidden lg:block">Sair</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DO PERFIL */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[#0B0D17]">
        
        {/* Banner Superior */}
        <section className="relative w-full h-[30vh] min-h-[250px] flex items-end pb-8 px-8 lg:px-12 bg-gradient-to-tr from-blue-900/30 to-slate-900 border-b border-white/5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888088301-ebba0f69a19c?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] to-transparent"></div>
          
          <div className="relative z-10 flex items-center gap-8 translate-y-12">
            
            {/* Foto de Perfil ou Iniciais */}
            <div className="h-32 w-32 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-4xl shadow-[0_0_30px_rgba(37,99,235,0.5)] border-4 border-[#0B0D17] overflow-hidden relative group">
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>

            <div className="pb-4">
              <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">{displayName}</h1>
              <div className="flex items-center gap-4 text-sm font-medium text-blue-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Aluno VIP</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-400"><Calendar className="h-4 w-4" /> Desde {joinDate}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Formulários e Dados */}
        <div className="max-w-6xl mx-auto w-full px-8 lg:px-12 pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            <div className="space-y-10">
              {/* Editar Nome e Foto */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-500" /> Editar Perfil
                </h2>
                
                {/* CORREÇÃO: O React cuida do encType automaticamente na Server Action */}
                <form action={updateProfile} className="space-y-6">
                  <input type="hidden" name="current_avatar_url" value={profile?.avatar_url || ''} />
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Nome Completo</label>
                    <input 
                      type="text" 
                      name="full_name" 
                      defaultValue={profile?.full_name || ''} 
                      placeholder="Seu nome..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Foto de Perfil</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        name="avatar" 
                        accept="image/*"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-all cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Formatos aceitos: JPG, PNG, GIF.</p>
                  </div>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">
                    Salvar Alterações
                  </button>
                </form>
              </div>

              {/* Informações da Conta Fixas */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Award className="h-6 w-6 text-blue-500" /> Detalhes da Conta
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail de Acesso</label>
                    <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl p-3.5 text-slate-300 text-sm">
                      <Mail className="h-4 w-4 text-slate-500" /> {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status da Assinatura</label>
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-emerald-400 font-bold text-sm">
                      <Shield className="h-4 w-4" /> Acesso Vitalício
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segurança e Senha */}
            <div className="h-fit bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Key className="h-6 w-6 text-yellow-500" /> Segurança da Conta
              </h2>
              
              <form action={updatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Nova Senha</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    placeholder="••••••••" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="••••••••" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    required
                    minLength={6}
                  />
                </div>
                
                <button className="w-full bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 text-slate-400 border border-white/5 hover:border-yellow-500/30 py-4 rounded-xl font-bold transition-all">
                  Atualizar Senha
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}