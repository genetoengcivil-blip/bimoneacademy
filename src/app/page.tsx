import Link from 'next/link'
import { 
  Layers, ArrowRight, ShieldCheck, 
  MonitorPlay, Award, Zap, CheckCircle2, 
  Building2, Droplets, BarChart3, Star, Quote,
  Users, Clock, PlayCircle
} from 'lucide-react'

export default function LandingPage() {
  const checkoutLinks = {
    basico: "https://checkout.nexano.io/plan-basico",
    intermediario: "https://checkout.nexano.io/plan-intermediario",
    avancado: "https://checkout.nexano.io/plan-avancado"
  }

  // Dados para os Carrosséis Infinitos
  const technologies = [
    "Autodesk Revit", "Navisworks Manage", "BIM 360", "Dynamo", 
    "Enscape", "AutoCAD", "Twinmotion", "ReCap Pro",
    "Autodesk Revit", "Navisworks Manage", "BIM 360", "Dynamo", 
    "Enscape", "AutoCAD", "Twinmotion", "ReCap Pro" 
  ]

  const testimonials = [
    {
      name: "Rafael Costa",
      role: "Engenheiro Civil",
      text: "A melhor plataforma de BIM que já vi. A interface parece a Netflix e a didática do Geraldo me fez entender compatibilização MEP em 1 semana.",
      avatar: "RC"
    },
    {
      name: "Mariana Souza",
      role: "Arquiteta",
      text: "A qualidade dos templates que vêm inclusos no plano Avançado já paga o curso inteiro. Apliquei no meu escritório e reduzi meus erros a zero.",
      avatar: "MS"
    },
    {
      name: "Lucas Almeida",
      role: "Estudante de Engenharia",
      text: "Fiquei impressionado com o suporte VIP. O Geraldo responde as dúvidas técnicas diretamente na plataforma. Vale cada centavo investido.",
      avatar: "LA"
    },
    {
      name: "Fernanda Lima",
      role: "BIM Manager",
      text: "O nível de detalhamento estrutural ensinado aqui é absurdo. A metodologia não ensina apenas cliques, ensina o pensamento por trás da engenharia.",
      avatar: "FL"
    }
  ]
  const loopTestimonials = [...testimonials, ...testimonials]

  return (
    <div className="min-h-screen bg-[#0B0D17] text-slate-50 font-sans selection:bg-blue-600 selection:text-white scroll-smooth overflow-x-hidden">
      
      {/* INJEÇÃO DE CSS PARA ANIMAÇÕES INFINITAS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: scroll 30s linear infinite;
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* ========================================== */}
      {/* NAVBAR */}
      {/* ========================================== */}
      <nav className="fixed w-full z-50 bg-[#0B0D17]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-blue-500" />
            <span className="font-black tracking-tighter text-xl text-white">BIM ONE</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#metodologia" className="hover:text-white transition-colors">Metodologia</Link>
            <Link href="#depoimentos" className="hover:text-white transition-colors">Alunos</Link>
            <Link href="#precos" className="hover:text-white transition-colors">Preços</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              Acessar Plataforma
            </Link>
          </div>
        </div>
      </nav>

      {/* ========================================== */}
      {/* HERO SECTION (VÍDEO CORRIGIDO E NÍTIDO) */}
      {/* ========================================== */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        
        {/* VÍDEO BACKGROUND */}
        <div className="absolute inset-0 z-0 bg-black">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            poster="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=2000"
            className="absolute inset-0 w-full h-full object-cover opacity-75 scale-100 transition-all duration-500"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Overlays atenuados para dar nitidez máxima ao vídeo e manter contraste no texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D17]/70 via-[#0B0D17]/40 to-[#0B0D17]"></div>
          <div className="absolute inset-0 bg-[#0B0D17]/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
            <Zap className="h-4 w-4 text-blue-500 fill-blue-500" /> Formação BIM de Elite
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight drop-shadow-2xl max-w-5xl leading-[1.1] text-white">
            Domine o Revit com a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Metodologia BIM One</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-100 mb-12 max-w-2xl font-semibold leading-relaxed drop-shadow-md bg-black/30 md:bg-transparent p-4 rounded-2xl backdrop-blur-sm md:backdrop-blur-none">
            Do projeto arquitetônico à coordenação de sistemas MEP e estrutural. A evolução completa da sua carreira em uma plataforma premium.
          </p>
          
          <Link 
            href="#precos" 
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-12 py-6 rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-1 text-xl"
          >
            Começar Agora
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ========================================== */}
      {/* SEÇÃO DE NÚMEROS (PROVA SOCIAL) */}
      {/* ========================================== */}
      <section className="relative z-20 -mt-16 mb-12 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
          
          <div className="flex flex-col items-center text-center px-4">
            <Users className="h-6 w-6 text-blue-500 mb-3" />
            <span className="text-3xl lg:text-5xl font-black text-white mb-1">2.500+</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Alunos Formados</span>
          </div>

          <div className="flex flex-col items-center text-center px-4">
            <PlayCircle className="h-6 w-6 text-emerald-500 mb-3" />
            <span className="text-3xl lg:text-5xl font-black text-white mb-1">180+</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Aulas em HD</span>
          </div>

          <div className="flex flex-col items-center text-center px-4">
            <Clock className="h-6 w-6 text-purple-500 mb-3" />
            <span className="text-3xl lg:text-5xl font-black text-white mb-1">40h</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">De Conteúdo Prático</span>
          </div>

          <div className="flex flex-col items-center text-center px-4">
            <Star className="h-6 w-6 text-yellow-500 mb-3" />
            <span className="text-3xl lg:text-5xl font-black text-white mb-1">4.9</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Avaliação Média</span>
          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* CARROSSEL DE TECNOLOGIAS (INFINITO) */}
      {/* ========================================== */}
      <div className="py-8 border-y border-white/5 bg-black/40 overflow-hidden relative flex items-center mt-12">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B0D17] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B0D17] to-transparent z-10"></div>
        
        <div className="animate-marquee gap-16 lg:gap-32 pr-16 lg:pr-32 flex items-center">
          {technologies.map((tech, index) => (
            <div key={index} className="text-xl lg:text-2xl font-black tracking-tighter text-slate-600 uppercase shrink-0">
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* SEÇÃO: METODOLOGIA DETALHADA */}
      {/* ========================================== */}
      <section id="metodologia" className="py-24 lg:py-32 relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Uma engenharia de <span className="text-blue-400">alta precisão.</span></h2>
            <p className="text-slate-400 text-lg">Esqueça a modelagem superficial. Nossa metodologia em 4 pilares aprofunda os conhecimentos desde a volumetria até o levantamento final de quantitativos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              <div className="bg-blue-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Building2 className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Modelagem Arquitetônica</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Iniciamos com a base de qualquer empreendimento. Você aprenderá a modelar paredes, pisos, fachadas complexas, telhados e a criar famílias paramétricas inteligentes, deixando o projeto 100% preparado para os complementares.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Detalhamento Estrutural</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Transição perfeita da arquitetura para a estrutura. Domine o lançamento de fundações, pilares, vigas e detalhamento de armaduras. Entenda como o Revit se comunica com softwares de cálculo e garante a segurança do projeto.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Droplets className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Sistemas MEP (Instalações)</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                A fase crítica da compatibilização. Modele instalações hidráulicas, sanitárias, elétricas e de climatização (HVAC). Descubra como identificar e resolver conflitos (Clash Detection) antes mesmo da obra começar.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              <div className="bg-yellow-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
                <BarChart3 className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">4. Quantitativos e Extração (5D)</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                O modelo só é valioso se gerar dados. Aprenda a extrair tabelas de quantitativos automáticas, criar pranchas executivas rigorosas e gerenciar as informações do modelo para gerar orçamentos precisos e sem retrabalho.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SEÇÃO: DEPOIMENTOS (CARROSSEL INFINITO) */}
      {/* ========================================== */}
      <section id="depoimentos" className="py-24 bg-black/30 border-y border-white/5 overflow-hidden flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto px-6 mb-16">
          <h2 className="text-4xl font-black mb-4">Quem confia na BIM One</h2>
          <p className="text-slate-400">Junte-se a milhares de profissionais que elevaram o padrão de seus projetos e dominaram o fluxo de trabalho das grandes construtoras.</p>
        </div>

        <div className="relative w-full flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0B0D17] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0B0D17] to-transparent z-10"></div>
          
          <div className="animate-marquee-slow pause-on-hover gap-8 pr-8 flex items-stretch">
            {loopTestimonials.map((testimonial, idx) => (
              <div key={idx} className="w-[350px] lg:w-[450px] shrink-0 bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex text-yellow-500 mb-6 gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <Quote className="h-8 w-8 text-blue-500/20 mb-4" />
                  <p className="text-slate-300 leading-relaxed mb-8">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold shadow-inner">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <span className="text-xs text-blue-400 uppercase tracking-widest">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SEÇÃO DE PREÇOS (PRICING) */}
      {/* ========================================== */}
      <section id="precos" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight text-white">Escolha seu plano</h2>
            <p className="text-slate-400 text-lg font-medium">Invista no conhecimento que vai transformar sua atuação no mercado de projetos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* PLANO BÁSICO */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden group shadow-lg">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-400 mb-4">Básico</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-500">R$</span>
                  <span className="text-5xl font-black text-white">197,90</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Revit Básico</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Modelagem da Arquitetura</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600 italic opacity-50">
                  <XIcon className="h-5 w-5 shrink-0" />
                  <span>Revit MEP</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600 italic opacity-50">
                  <XIcon className="h-5 w-5 shrink-0" />
                  <span>Revit Estrutural</span>
                </li>
              </ul>

              <Link 
                href={checkoutLinks.basico}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all border border-white/10 text-center"
              >
                Selecionar Plano
              </Link>
            </div>

            {/* PLANO INTERMEDIÁRIO */}
            <div className="bg-gradient-to-b from-blue-600/20 to-indigo-600/5 border border-blue-500/30 rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden transform md:scale-105 shadow-[0_0_50px_rgba(37,99,235,0.15)] z-10 mt-4 md:mt-0">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-xl shadow-md">Popular</div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Intermediário</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-blue-500">R$</span>
                  <span className="text-5xl font-black text-white">397,90</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                  <span className="font-semibold">Plano Básico Inclusion</span>
                </li>
                <li className="flex items-center gap-3 text-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                  <span className="font-semibold">Revit MEP (Hidro e Elétrica)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                  <span>Suporte VIP nas Aulas</span>
                </li>
                <li className="flex items-center gap-3 text-slate-500 italic opacity-50">
                  <XIcon className="h-5 w-5 shrink-0" />
                  <span>Revit Estrutural</span>
                </li>
              </ul>

              <Link 
                href={checkoutLinks.intermediario}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] text-center transform hover:-translate-y-0.5"
              >
                Garantir Vaga
              </Link>
            </div>

            {/* PLANO AVANÇADO */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden mt-4 md:mt-0 shadow-lg">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-400 mb-4">Avançado</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-500">R$</span>
                  <span className="text-5xl font-black text-white">597,90</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Revit Básico + MEP</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="font-bold text-white">Revit Estrutural Completo</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Coordenação de Projetos</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Acesso aos Templates Reais</span>
                </li>
              </ul>

              <Link 
                href={checkoutLinks.avancado}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all border border-white/10 text-center"
              >
                Selecionar Plano
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* INSTRUTOR */}
      {/* ========================================== */}
      <section id="instrutor" className="py-24 lg:py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0B0D17]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden mx-auto mb-8 border-2 border-blue-500 p-1 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500" 
              className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500" 
              alt="Geraldo Neves" 
            />
          </div>
          <h2 className="text-3xl font-black mb-4">Geraldo Neves</h2>
          <p className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-6">Especialista BIM & Desenvolvedor</p>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Com vasta experiência no setor de engenharia e desenvolvimento de software, Geraldo fundou a BIM One Academy com o objetivo de democratizar o acesso à metodologia BIM de alto nível, unindo tecnologia de ponta e práticas reais de canteiro de obras e compatibilização.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* FOOTER */}
      {/* ========================================== */}
      <footer className="bg-[#0B0D17] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-blue-500" />
            <span className="font-black tracking-tighter text-lg text-white">BIM ONE ACADEMY</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>

          <p className="text-slate-600 text-sm font-medium text-center">
            &copy; {new Date().getFullYear()} Desenvolvido por Geraldo Neves.
          </p>
        </div>
      </footer>

    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}