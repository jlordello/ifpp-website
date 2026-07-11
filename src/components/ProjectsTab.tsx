import { useState } from 'react';
import { Project, Emenda } from '../types';
import { 
  Briefcase, BookOpen, Calendar, MapPin, Users, HelpCircle, 
  Search, Filter, ChevronRight, Sparkles, Award, Star, DollarSign, Landmark 
} from 'lucide-react';

interface ProjectsTabProps {
  projects: Project[];
  emendas: Emenda[];
  onNavigateToTransparency: () => void;
}

export default function ProjectsTab({ projects, emendas, onNavigateToTransparency }: ProjectsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Filter logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'todos' || p.type === filterType;
    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">Concluído</span>;
      case 'em_andamento':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">Em Andamento</span>;
      case 'planejado':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-50 text-slate-500 border border-slate-200">Planejado</span>;
      default:
        return null;
    }
  };

  const getProjTypeIcon = (type: string) => {
    switch (type) {
      case 'projeto':
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'curso':
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case 'evento':
        return <Star className="w-5 h-5 text-amber-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div id="projects-view" className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Title & Intro */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-950">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Nossas Ações Transformadoras
          </div>
          <h1 className="text-xl sm:text-4xl font-extrabold text-indigo-950 tracking-tight">
            Projetos, Cursos Livres e Eventos Culturais
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-3xl">
            Desde a fundação em 2021, o IFPP executa oficinas, debates e eventos integradores financiados por recursos públicos de emendas parlamentares. Abaixo, explore o impacto social gerado diretamente nos territórios.
          </p>
        </div>

        {/* Featured Dynamic Showcases (Sonhos da Juventude / Hip-Hop) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Sonhos da Juventude Banner Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-800/30 -mr-8 -mt-8" />
            <div className="relative z-10 space-y-4">
              <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Nosso Maior Programa Cultural
              </span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">Programa "Sonhos da Juventude"</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Este programa representa um marco histórico de inclusão social e fomento cultural promovido pelo IFPP. Abrangeu mais de 40 oficinas dinâmicas e debates práticos em áreas inovadoras de economia criativa contemporânea como fotografia digital, técnicas de audiovisual e gestão de mídias sociais.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/30">
                  <span className="block text-lg font-black text-emerald-400">1200+</span>
                  <span className="text-[10px] text-slate-400">Jovens</span>
                </div>
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/30">
                  <span className="block text-lg font-black text-emerald-400">40+</span>
                  <span className="text-[10px] text-slate-400">Oficinas</span>
                </div>
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/30">
                  <span className="block text-lg font-black text-emerald-400">3</span>
                  <span className="text-[10px] text-slate-400">Cidades</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hip-Hop and Funk 2023 */}
          <div className="bg-gradient-to-br from-emerald-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-800/20 -mr-8 -mt-8" />
            <div className="relative z-10 space-y-4">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Oficina de Expressão & Ritmo 2023
              </span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">Oficinas de Hip-Hop e Funk</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Iniciativa dedicada à infância e à adolescência em territórios periféricos do Rio de Janeiro. A música e a dança urbana atuaram como catalisadores para a reintegração educacional, a expressão de sentimentos, o respeito coletivo e o desenvolvimento pessoal.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-850/30">
                  <span className="block text-lg font-black text-amber-400">250+</span>
                  <span className="text-[10px] text-slate-400">Alunos</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-850/30">
                  <span className="block text-lg font-black text-amber-400">100%</span>
                  <span className="text-[10px] text-slate-400 font-medium">Gratuito</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-850/30">
                  <span className="block text-lg font-black text-amber-400">RJ</span>
                  <span className="text-[10px] text-slate-400">Favelas</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Filters and List block */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-indigo-950">Filtro de Iniciativas do IFPP</h3>
              <p className="text-xs text-slate-500 mt-1">Veja a destinação de orçamento e emendas para cada projeto cadastrado</p>
            </div>

            {/* Inputs & Filters */}
            <div className="flex flex-wrap gap-2">
              
              <div className="relative shrink-0 w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-700 cursor-pointer"
                >
                  <option value="todos">Todos os Formatos</option>
                  <option value="projeto">Apenas Projetos Anuais</option>
                  <option value="curso">Apenas Oficinas & Cursos</option>
                  <option value="evento">Apenas Eventos & Recreações</option>
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-700 cursor-pointer"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluídos</option>
                  <option value="planejado">Planejados / Futuros</option>
                </select>
              </div>

            </div>
          </div>

          {/* Grid list of dynamic projects */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredProjects.map((p) => {
                // Find matching emenda funding source
                const linkedEmenda = emendas.find(e => e.id === p.emendaId);

                return (
                  <div 
                    key={p.id} 
                    className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                            {getProjTypeIcon(p.type)}
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-indigo-950 uppercase tracking-wide leading-none capitalize">
                              {p.type}
                            </span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Lançado em {p.year}</span>
                          </div>
                        </div>
                        {getStatusBadge(p.status)}
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                        {p.title}
                      </h4>
                      
                      <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Info Pills Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-50 text-xs">
                        {p.location && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{p.location}</span>
                          </div>
                        )}
                        {p.impact && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Users className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{p.impact}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Funding & Audit Section */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      {/* Linked Emenda Source */}
                      {linkedEmenda ? (
                        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100/30 flex items-center gap-2 w-full sm:w-auto">
                          <Landmark className="w-4 h-4 text-indigo-700 shrink-0" />
                          <div className="text-[10px]">
                            <span className="block font-bold text-indigo-950 font-mono leading-none">{linkedEmenda.code}</span>
                            <span className="block text-slate-500 mt-0.5 font-sans leading-none">{linkedEmenda.author}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-slate-50 flex items-center gap-2 w-full sm:w-auto">
                          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="text-[10px]">
                            <span className="block font-bold text-slate-500 leading-none">Aporte Ordinário</span>
                            <span className="block text-slate-400 mt-0.5 leading-none">Recurso Próprio IFPP</span>
                          </div>
                        </div>
                      )}

                      {/* Budget and navigation to accounts */}
                      <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end w-full sm:w-auto shrink-0">
                        {p.budget && (
                          <span className="text-xs font-mono font-bold text-slate-900 block">
                            Orçamento: {p.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        )}
                        <button
                          onClick={onNavigateToTransparency}
                          className="text-xs font-bold text-indigo-700 hover:text-indigo-950 inline-flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          Ver Prestação de Contas
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl bg-white">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 mt-4">Nenhum projeto ou curso encontrado</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
                Nenhuma ação do IFPP se encaixa nos filtros especificados atualmente. Tente redefinir suas seleções.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
