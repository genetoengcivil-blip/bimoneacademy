import Link from 'next/link'
import { ArrowLeft, Layers } from 'lucide-react'

export default function TermosPage() {
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
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">Termos de Serviço</h1>
          <p className="text-sm text-slate-500 mb-10 uppercase tracking-widest font-bold">Última atualização: Maio de 2026</p>
          
          <div className="space-y-8 text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Aceitação dos Termos</h2>
              <p>Ao acessar e utilizar a plataforma BIM One Academy, você concorda em cumprir e ser regido por estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deverá acessar a plataforma.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Acesso à Plataforma</h2>
              <p>A BIM One Academy concede a você uma licença limitada, não exclusiva e intransferível para acessar o conteúdo educacional exclusivamente para seu uso pessoal e não comercial. O compartilhamento de credenciais de acesso é estritamente proibido e pode resultar no cancelamento imediato da conta sem aviso prévio.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Propriedade Intelectual</h2>
              <p>Todo o conteúdo presente na plataforma, incluindo aulas em vídeo, materiais de apoio, textos, gráficos, logotipos e templates de Revit, é de propriedade exclusiva da BIM One Academy ou de seus licenciadores. É proibida a cópia, distribuição, reprodução ou modificação de qualquer material sem autorização prévia por escrito.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Comportamento na Comunidade</h2>
              <p>Ao utilizar os fóruns de dúvidas e áreas de comentários, você concorda em manter um ambiente de respeito mútuo. Conteúdo ofensivo, spam, ou que viole direitos de terceiros será removido, e o usuário poderá sofrer penalidades, incluindo a suspensão da conta.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Modificações no Serviço</h2>
              <p>A BIM One Academy reserva-se o direito de modificar, suspender ou descontinuar a plataforma, bem como alterar os conteúdos dos cursos, a qualquer momento e sem aviso prévio, buscando sempre a melhoria da experiência educacional.</p>
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