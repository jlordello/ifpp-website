import { useState } from 'react';
import { 
  Award, Users, BookOpen, Compass, ArrowRight, Music, Camera, Sparkles, 
  Building2, Trophy, Palette, GraduationCap, HeartHandshake, MapPin, 
  ChevronRight, TrendingUp, DollarSign, Calendar, ChevronDown, CheckCircle, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeTabProps {
  onNavigate: (tab: string) => void;
}

export default function HomeTab({ onNavigate }: HomeTabProps) {
  // States for interactive modules
  const [activePillar, setActivePillar] = useState<string>('cultura');
  const [activeCity, setActiveCity] = useState<string>('petropolis');
  
  // Simulator State
  const [simBudget, setSimBudget] = useState<number>(65000);
  const [simPillar, setSimPillar] = useState<string>('esporte');

  // Transformation Pillars Data
  const pillars = [
    {
      id: 'cultura',
      title: 'Cultura & Arte',
      short: 'Cultura',
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      badgeColor: 'bg-rose-500/10 text-rose-700',
      lead: 'A cultura como linguagem de liberdade, emancipação e geração de renda.',
      headline: 'Oficinas de Hip-Hop, Funk, Produção Audiovisual e Fotografia Digital',
      impactStat: '+1.450 Jovens Assistidos',
      description: 'Acreditamos que a expressão artística é o maior vetor de transformação nas periferias. Oferecemos oficinas práticas gratuitas em ritmos urbanos, audiovisual e fotografia, permitindo que a juventude expresse suas realidades e desenvolva competências de empregabilidade na florescente economia criativa local.',
      bullets: [
        'Aulas gratuitas com profissionais atuantes no mercado da arte',
        'Oficinas práticas com equipamentos de ponta para audiovisual',
        'Valorização de manifestações culturais periféricas (Funk, Hip-Hop, Slam)',
        'Exposições culturais e mostras de cinema comunitárias'
      ]
    },
    {
      id: 'esporte',
      title: 'Esporte & Saúde',
      short: 'Esporte',
      icon: Trophy,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      badgeColor: 'bg-emerald-500/10 text-emerald-700',
      lead: 'Inclusão social por meio da disciplina, saúde integral e respeito mútuo.',
      headline: 'Polos de Karatê, Capoeira, Judô e Futebol de Rua',
      impactStat: '400+ Alunos Ativos/Mês',
      description: 'O esporte funciona como um escudo protetor para a juventude em áreas vulneráveis. Nossas ações promovem a saúde integral, o foco educacional e formam cidadãos conscientes dos seus deveres e direitos coletivos por meio das artes marciais e esportes comunitários.',
      bullets: [
        'Distribuição 100% gratuita de quimonos, uniformes e lanches',
        'Polos semanais integrados no cotidiano comunitário',
        'Torneios internos e festivais integradores regionais',
        'Apoio psicopedagógico e incentivo à frequência escolar regular'
      ]
    },
    {
      id: 'educacao',
      title: 'Educação Complementar',
      short: 'Educação',
      icon: BookOpen,
      color: 'from-indigo-500 to-blue-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      badgeColor: 'bg-indigo-500/10 text-indigo-700',
      lead: 'Letramento digital, reforço escolar dinâmico e desenvolvimento lógico.',
      headline: 'Robótica Criativa, Auxílio Escolar e Clubes de Leitura',
      impactStat: '92% De Permanência Escolar',
      description: 'Oferecemos suporte no contraturno escolar para preencher lacunas de aprendizagem de forma lúdica. Ao aproximar crianças de tecnologias acessíveis como computação, robótica reciclada e livros infanto-juvenis, geramos gosto pelo conhecimento continuado.',
      bullets: [
        'Apoio escolar personalizado em Língua Portuguesa e Matemática',
        'Clubes de leitura ativos com doação regular de acervos',
        'Iniciação tecnológica através de robótica educativa de baixo custo',
        'Oficinas de escrita criativa e debates sobre temas atuais'
      ]
    },
    {
      id: 'formacao',
      title: 'Formação & Economia',
      short: 'Formação',
      icon: GraduationCap,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      badgeColor: 'bg-amber-500/10 text-amber-700',
      lead: 'Qualificação técnica real para inserção no mercado de trabalho moderno.',
      headline: 'Cursos de Mídias Sociais, Gestão de Eventos e Projetos Culturais',
      impactStat: '450+ Certificados Emitidos',
      description: 'Preparamos jovens e adultos para as reais necessidades corporativas e de autoempreendedorismo. Nossos cursos rápidos ensinam a utilizar as mídias sociais comercialmente, planejar pequenos negócios locais e gerir verbas para editais culturais.',
      bullets: [
        'Certificação rápida com alta aplicabilidade no ecossistema atual',
        'Foco em mídias sociais, comunicação e marketing para negócios de favela',
        'Capacitação de produtores de eventos e gestores de redes sociais',
        'Mentoria direta para estruturação de portfólios e currículos'
      ]
    },
    {
      id: 'cidadania',
      title: 'Cidadania & Políticas',
      short: 'Cidadania',
      icon: HeartHandshake,
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      badgeColor: 'bg-purple-500/10 text-purple-700',
      lead: 'Fortalecimento do protagonismo social e capacitação de lideranças.',
      headline: 'Curso de Elaboração de Projetos Sociais e Direito Coletivo',
      impactStat: '80 Líderes Locais Formados',
      description: 'Capacitamos cidadãos das periferias a serem autores da sua própria história política. Ensinamos a mapear gargalos nos territórios, redigir propostas bem estruturadas para conselhos e compreender o funcionamento do orçamento público e emendas parlamentares.',
      bullets: [
        'Aulas sobre o Estatuto da Juventude, Estatuto da Criança e do Adolescente',
        'Simulações práticas de elaboração e captação de editais sociais',
        'Mediação de debates com secretarias públicas municipais',
        'Criação de comitês territoriais para fiscalização de recursos'
      ]
    }
  ];

  // Cities Data
  const cities = {
    petropolis: {
      name: 'Petrópolis',
      subtitle: 'Região Serrana • Esportes e Economia Criativa',
      description: 'Nas regiões serranas, o relevo e o isolamento geográfico de certas comunidades exigem ações descentralizadas. Concentramos nossas ações na inserção do karatê, capoeira e oficinas de fomento profissional.',
      metrics: [
        { label: 'Jovens Atendidos', value: '350+' },
        { label: 'Polos Ativos', value: '4' },
        { label: 'Modalidades Esportivas', value: '3' }
      ],
      projects: [
        'Esporte para o Futuro (Aulas semanais)',
        'Oficinas itinerantes de iniciação ao audiovisual',
        'Distribuição de cestas de suporte social e lanche nos contraturnos'
      ]
    },
    paraiba: {
      name: 'Paraíba do Sul',
      subtitle: 'Centro-Sul Fluminense • Lideranças e Políticas',
      description: 'Atuamos fortemente na consolidação da cidadania civil e do controle social. O município abriga seminários de formulação e apoio logístico para novas emendas destinadas a coletivos do interior do Estado.',
      metrics: [
        { label: 'Agentes Formados', value: '150+' },
        { label: 'Parcerias Institucionais', value: '5' },
        { label: 'Debates Públicos Realizados', value: '12' }
      ],
      projects: [
        'Curso de Liderança Comunitária e Formulação Técnica',
        'Fóruns de debate itinerante sobre orçamento público',
        'Oficinas de economia criativa e novas mídias para agricultores familiares'
      ]
    },
    rio: {
      name: 'Rio de Janeiro',
      subtitle: 'Região Metropolitana • Cultura Urbana e Inclusão Social',
      description: 'A capital abriga nossos projetos mais populosos, focando na riqueza cultural de territórios como Jacarezinho, Complexo da Maré e Zona Oeste. Combatemos as profundas assimetrias urbanas por meio de expressões artísticas autênticas.',
      metrics: [
        { label: 'Jovens Qualificados', value: '900+' },
        { label: 'Comunidades Atendidas', value: '8+' },
        { label: 'Oficinas e Workshops', value: '40+' }
      ],
      projects: [
        'Programa Sonhos da Juventude (Edição histórica)',
        'Oficina de Ritmos Urbanos: Hip-Hop, Funk e Grafite para crianças',
        'Certificação de assessores para fomento de políticas públicas metropolitanas'
      ]
    }
  };

  // Simulator Calculator logic
  const calculateSimulatorResults = () => {
    let multiplier = simBudget / 50000;
    
    switch (simPillar) {
      case 'cultura':
        return {
          beneficiarios: Math.floor(multiplier * 400),
          unidades: Math.floor(multiplier * 15),
          horas: Math.floor(multiplier * 160),
          unidadesLabel: 'Oficinas ministradas',
          horasLabel: 'Horas de gravação e práticas',
          outcomeText: 'Esses recursos financiam lanches diários, equipamentos audiovisuais portáteis, material didático e remuneração justa para oficineiros locais de arte.',
          highlights: ['Exposição de fotos final', 'Mostra de cinema de favela', 'Criação de portfólio digital']
        };
      case 'esporte':
        return {
          beneficiarios: Math.floor(multiplier * 300),
          unidades: Math.floor(multiplier * 250),
          horas: Math.floor(multiplier * 240),
          unidadesLabel: 'Quimonos/Uniformes doados',
          horasLabel: 'Horas de treino monitorado',
          outcomeText: 'Cobre o custo de contratação de mestres de karatê e capoeira, tatames profissionais, kits esportivos de alta durabilidade e lanches proteicos após treinos.',
          highlights: ['Equipamento de segurança completo', 'Inscrição em torneios federados', 'Acompanhamento nutricional básico']
        };
      case 'educacao':
        return {
          beneficiarios: Math.floor(multiplier * 250),
          unidades: Math.floor(multiplier * 350),
          horas: Math.floor(multiplier * 180),
          unidadesLabel: 'Livros e materiais entregues',
          horasLabel: 'Atendimentos psicopedagógicos',
          outcomeText: 'Garante o aluguel de espaços para as oficinas de robótica criativa, aquisição de componentes eletrônicos básicos, computadores recondicionados e lanches nutritivos.',
          highlights: ['Laboratório de robótica portátil', 'Visitas culturais a museus do RJ', 'Letramento digital avançado']
        };
      case 'formacao':
        return {
          beneficiarios: Math.floor(multiplier * 200),
          unidades: Math.floor(multiplier * 120),
          horas: Math.floor(multiplier * 140),
          unidadesLabel: 'Certificados emitidos',
          horasLabel: 'Aulas de mentoria individual',
          outcomeText: 'Permite estruturar salas multimídia, contratar especialistas em redes sociais, marketing e produção executiva para capacitar jovens em busca do primeiro emprego.',
          highlights: ['Elaboração de currículo e portfólio', 'Simulação de entrevistas de trabalho', 'Mentoria para microempreendedorismo']
        };
      case 'cidadania':
        return {
          beneficiarios: Math.floor(multiplier * 100),
          unidades: Math.floor(multiplier * 40),
          horas: Math.floor(multiplier * 90),
          unidadesLabel: 'Propostas de lei estruturadas',
          horasLabel: 'Sessões de consultoria jurídica',
          outcomeText: 'Auxilia na impressão de cartilhas informativas de direito urbano, consultoria para formulação de petições públicas coletivas e passagens para visitas a conselhos municipais.',
          highlights: ['Mapeamento de gargalos territoriais', 'Apresentação em conselhos tutelares', 'Autonomia na redação de emendas']
        };
      default:
        return {
          beneficiarios: 0,
          unidades: 0,
          horas: 0,
          unidadesLabel: 'Unidades',
          horasLabel: 'Horas',
          outcomeText: '',
          highlights: []
        };
    }
  };

  const simResult = calculateSimulatorResults();
  const currentPillarObj = pillars.find(p => p.id === activePillar) || pillars[0];
  const activeCityObj = cities[activeCity as keyof typeof cities] || cities.petropolis;

  return (
    <div id="home-view" className="bg-slate-50 min-h-screen selection:bg-indigo-600 selection:text-white">
      
      {/* 1. Dynamic modern Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-24 pb-28 px-4 sm:px-6 lg:px-8 border-b border-indigo-950">
        {/* Colorful ambient background glows */}
        <div className="absolute top-1/10 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[130px] -translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-1/10 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px] translate-x-1/2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-rose-500/5 blur-[100px] -translate-x-1/2 pointer-events-none" />

        {/* Diagonal geometric grid line accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          
          {/* Animated floating location badge */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-[9px] min-[360px]:text-[10px] sm:text-xs font-semibold text-indigo-300 mb-8 shadow-inner shadow-indigo-900/60 whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-bounce" />
            <span>Presença Ativa: <strong className="font-bold">Petrópolis • Paraíba do Sul • Rio de Janeiro</strong></span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-5xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1]"
          >
            Nós transformamos vidas através do <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-300 to-rose-400">impacto social real</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-sm sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            O <strong>IFPP</strong> constrói novas realidades nas periferias fluminenses por meio de programas integrados de <span className="text-white underline decoration-rose-500 decoration-2 underline-offset-4">Cultura</span>, <span className="text-white underline decoration-emerald-500 decoration-2 underline-offset-4">Esporte</span>, <span className="text-white underline decoration-indigo-400 decoration-2 underline-offset-4">Educação</span>, <span className="text-white underline decoration-amber-500 decoration-2 underline-offset-4">Formação</span> e <span className="text-white underline decoration-purple-500 decoration-2 underline-offset-4">Cidadania</span>.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => onNavigate('projects')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-indigo-950 font-black transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              Ver Nossas Ações
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('transparency')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/20 text-indigo-200 hover:text-white font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Shield className="w-5 h-5 text-indigo-400" />
              Transparência Pública
            </button>
          </motion.div>

        </div>
      </section>

      {/* 2. Key Stats Panel */}
      <section className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100">
          
          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-950">+1.200</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Jovens Qualificados</div>
          </div>

          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-950">+40</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Oficinas Realizadas</div>
          </div>

          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-950">3</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Municípios Atendidos</div>
          </div>

          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-950">100%</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Contas Auditadas</div>
          </div>

        </div>
      </section>

      {/* 3. New Feature: Interactive Pillars Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Pilares de Transformação
          </span>
          <h2 className="text-xl sm:text-5xl font-black text-indigo-950 tracking-tight leading-none">
            Como Transformamos Vidas na Prática
          </h2>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Nossa atuação baseia-se em cinco frentes coordenadas para garantir inclusão, autovalorização e desenvolvimento profissional de comunidades carentes. Clique nos pilares para explorar:
          </p>
        </div>

        {/* Pillars selector tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillar(pillar.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-950 border border-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{pillar.short}</span>
              </button>
            );
          })}
        </div>

        {/* Pillar Display Box (Glassmorphism & High-Quality Design) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Accent Color Band */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${currentPillarObj.badgeColor}`}>
                Eixo Temático Principal
              </span>
              <h3 className="text-lg sm:text-3.5xl font-black text-slate-900 leading-tight">
                {currentPillarObj.title}
              </h3>
              <p className="text-indigo-950/80 font-semibold text-xs sm:text-base italic">
                "{currentPillarObj.lead}"
              </p>
              <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
                {currentPillarObj.description}
              </p>
              
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ações Executadas no Eixo:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 font-medium">
                  {currentPillarObj.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-950 font-mono">{currentPillarObj.impactStat}</span>
              </div>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs sm:text-sm font-bold text-indigo-700 hover:text-indigo-950 inline-flex items-center gap-1.5 group cursor-pointer"
              >
                Ver projetos deste eixo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Dynamic illustration panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Visual glow element */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <span className="text-indigo-400 text-xs font-mono tracking-wider uppercase">Destaque Operacional</span>
              <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                {currentPillarObj.headline}
              </h4>
            </div>

            <div className="mt-8 lg:mt-0 space-y-4 relative z-10 p-5 rounded-2xl bg-indigo-950/60 border border-indigo-800/30">
              <h5 className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Garantia do IFPP</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todas as nossas oficinas incluem fardamento, material didático apropriado, lanche para os alunos e certificado final oficial de formação técnica básica.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. New Feature: Regional Impact Explorer (Territory Hub) */}
      <section className="py-20 bg-indigo-950 text-white relative overflow-hidden">
        {/* Colorful ambient background glows */}
        <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Info Text */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                <MapPin className="w-3.5 h-3.5" />
                Territórios de Atuação
              </span>
              <h2 className="text-xl sm:text-5xl font-black tracking-tight leading-none">
                Nossa Presença nos Municípios
              </h2>
              <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                Atuamos de forma georreferenciada atendendo às necessidades locais específicas de cada município. Clique nas cidades para ver indicadores e iniciativas vigentes:
              </p>

              {/* City selector buttons */}
              <div className="flex flex-col gap-2.5">
                {(Object.keys(cities) as Array<keyof typeof cities>).map((key) => {
                  const isActive = activeCity === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCity(key)}
                      className={`w-full text-left p-4 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer border ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border-emerald-400 text-emerald-300 shadow-lg'
                          : 'bg-indigo-950/40 border-indigo-900 text-slate-400 hover:text-white hover:border-indigo-800'
                      }`}
                    >
                      <span className="text-sm sm:text-base">{cities[key].name}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1 text-emerald-400' : 'text-slate-500'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Display Card */}
            <div className="lg:col-span-7 bg-indigo-900/40 border border-indigo-800/40 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-sm space-y-8">
              
              <div className="space-y-2">
                <h3 className="text-lg sm:text-3xl font-black text-white">{activeCityObj.name}</h3>
                <p className="text-emerald-400 text-[10px] sm:text-sm font-mono">{activeCityObj.subtitle}</p>
              </div>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                {activeCityObj.description}
              </p>

              {/* Metric grid */}
              <div className="grid grid-cols-3 gap-3">
                {activeCityObj.metrics.map((m, idx) => (
                  <div key={idx} className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-800/20 text-center">
                    <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono">{m.value}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-tight">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Active Projects bullet block */}
              <div className="space-y-3 pt-6 border-t border-indigo-800/40">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Principais Iniciativas no Território:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
                  {activeCityObj.projects.map((proj, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{proj}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. New Feature: Gamified Social Impact Simulator */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            Transparência e Eficiência
          </span>
          <h2 className="text-xl sm:text-5xl font-black text-indigo-950 tracking-tight leading-none">
            Simulador de Impacto Social
          </h2>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Arraste os controles abaixo para simular de forma lúdica como emendas parlamentares e recursos públicos são convertidos diretamente em transformações práticas nos territórios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-100 p-6 sm:p-10 rounded-3xl shadow-xl">
          
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-lg font-bold text-indigo-950">1. Configure a Simulação</h3>
            <p className="text-xs text-slate-500">Defina o montante de repasse hipotético e o eixo temático que deseja avaliar:</p>
            
            {/* Budget Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Orçamento do Repasse:</span>
                <span className="text-sm font-mono text-indigo-600">
                  {simBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </span>
              </div>
              <input 
                type="range" 
                min={10000} 
                max={200000} 
                step={5000}
                value={simBudget} 
                onChange={(e) => setSimBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>R$ 10 mil</span>
                <span>R$ 100 mil</span>
                <span>R$ 200 mil</span>
              </div>
            </div>

            {/* Pillar Selector Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Eixo Temático de Destinação:</label>
              <select
                value={simPillar}
                onChange={(e) => setSimPillar(e.target.value)}
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-700 cursor-pointer"
              >
                <option value="cultura">Cultura & Economia Criativa</option>
                <option value="esporte">Esporte & Integração Social</option>
                <option value="educacao">Educação Complementar</option>
                <option value="formacao">Formação Profissional</option>
                <option value="cidadania">Cidadania & Políticas Públicas</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/30 text-[11px] text-slate-600 leading-relaxed">
              <strong>Nota sobre Transparência:</strong> Este simulador utiliza taxas médias de conversão com base em execuções de projetos passados, demonstrando o compromisso de otimização de cada centavo público gerido pelo IFPP.
            </div>
          </div>

          {/* Results Output Screen */}
          <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            
            {/* Visual Header */}
            <div className="flex justify-between items-center pb-4 border-b border-indigo-950/80">
              <div>
                <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Resultado Estimado</span>
                <span className="text-xs text-slate-400">Entrega real gerada nas comunidades</span>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>

            {/* Output Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              
              <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-950/80 text-center">
                <span className="block text-xl sm:text-3xl font-black text-white font-mono">{simResult.beneficiarios}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-tight">Moradores Impactados</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-950/80 text-center">
                <span className="block text-xl sm:text-3xl font-black text-emerald-400 font-mono">{simResult.unidades}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-tight">{simResult.unidadesLabel}</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-950/80 text-center">
                <span className="block text-xl sm:text-3xl font-black text-indigo-300 font-mono">{simResult.horas}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-tight">{simResult.horasLabel}</span>
              </div>

            </div>

            {/* Explanatory text */}
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-indigo-950/40">
                {simResult.outcomeText}
              </p>

              {/* Bullet highlights */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Metas Adicionais Geradas:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {simResult.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom action linked to transparency */}
            <div className="pt-6 border-t border-indigo-950/80 mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] text-slate-400">Todas as contas são publicadas sob auditoria civil.</span>
              <button
                onClick={() => onNavigate('transparency')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
              >
                Auditar Contas Atuais
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Purpose, Mission & Leadership details */}
      <section className="py-20 bg-slate-100 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                <Building2 className="w-3.5 h-3.5" />
                Quem Somos
              </span>
              <h2 className="text-xl sm:text-4.5xl font-black text-indigo-950 tracking-tight leading-none">
                Nossa Trajetória Social
              </h2>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-base">
                O <strong>Instituto de Formação e Promoção de Políticas Públicas (IFPP)</strong> iniciou sua jornada em 2021 para atuar como ponte ativa entre o orçamento do fomento público e a realidade das favelas e bairros populares fluminenses. 
              </p>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-base">
                Acreditamos na integridade absoluta. Por isso, aliamos a inovação pedagógica e desportiva com a <strong>auditoria transparente</strong> de cada centavo das emendas parlamentares destinadas aos nossos projetos.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl border border-slate-200/60 bg-white shadow-sm flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/30">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Transparência Ativa</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Certificados e notas disponíveis a toda prefeitura parceira.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/60 bg-white shadow-sm flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/30">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Escopo Descentralizado</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Presença na Região Serrana, Metropolitana e Centro-Sul.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative p-6 sm:p-10 rounded-3xl bg-indigo-900 text-white shadow-2xl overflow-hidden border border-indigo-800/60">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-800/40 -mr-12 -mt-12" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight">Compromisso Regional</h3>
                  <p className="text-indigo-200 text-xs sm:text-base leading-relaxed italic">
                    "Atuar no Rio de Janeiro, Petrópolis e Paraíba do Sul nos ensina as diferentes dimensões da vulnerabilidade social. O esporte que traz foco, a cultura que gera renda e a educação complementar que consolida o jovem são as bases do nosso mandato social."
                  </p>
                  <div className="border-t border-indigo-800/80 pt-6 flex justify-between items-center text-xs text-indigo-300">
                    <div>
                      <span className="block font-bold text-white text-sm">Diretoria Executiva IFPP</span>
                      <span className="block mt-0.5">Mandato de Gestão • Registro 2021</span>
                    </div>
                    <div className="px-3 py-1.5 rounded bg-indigo-800/50 text-white font-mono uppercase font-semibold tracking-wider text-[10px] border border-indigo-700/50">
                      Utilidade Civil
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
