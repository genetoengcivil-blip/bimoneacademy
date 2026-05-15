import Link from 'next/link'
import { ArrowLeft, Layers } from 'lucide-react'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0B0D17] text-slate-300 font-sans selection:bg-blue-600 selection:text-white py-12 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <header className="mb-12 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-500" />
            <span className="font-black tracking-tighter text-white">BIM ONE</span>
          </div>
        </header>

        <main className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 lg:p-12 backdrop-blur-sm shadow-2xl">
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">Política de Privacidade</h1>
          <p className="text-sm text-slate-500 mb-10 uppercase tracking-widest font-bold">Última atualização: Maio de 2026</p>
          
          <div className="space-y-8 text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Informações que Coletamos</h2>
              <p>Ao se cadastrar na BIM One Academy, coletamos informações essenciais para a prestação do serviço, incluindo seu endereço de e-mail, nome completo (se fornecido) e senha criptografada. Também monitoramos seu progresso nas aulas, anotações pessoais cadastradas e interações no fórum da plataforma.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Como Usamos suas Informações</h2>
              <p>Os dados coletados são utilizados exclusivamente para gerenciar sua conta, fornecer suporte técnico, personalizar sua experiência de aprendizado, e emitir comunicados importantes sobre atualizações de cursos e da plataforma. Suas anotações pessoais são privadas e não são acessadas por outros usuários.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Proteção de Dados (LGPD)</h2>
              <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil, implementamos medidas de segurança robustas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Suas senhas são mantidas utilizando protocolos de criptografia de alto padrão.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Compartilhamento de Informações</h2>
              <p>A BIM One Academy não vende, aluga ou compartilha suas informações pessoais com terceiros para fins de marketing. Podemos compartilhar dados estritamente necessários com provedores de serviços terceirizados (como gateways de pagamento e serviços de hospedagem em nuvem) apenas para garantir o funcionamento da plataforma.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Seus Direitos</h2>
              <p>Você tem o direito de solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento. Para exercer esses direitos ou para esclarecer dúvidas sobre esta política, entre em contato através do painel de suporte da plataforma.</p>
            </section>
          </div>
        </main>

        <footer className="mt-12 text-center text-sm text-slate-600">
          &copy; {new Date().getFullYear()} BIM One Academy. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}