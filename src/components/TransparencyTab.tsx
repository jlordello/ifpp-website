import { useState, useMemo } from 'react';
import { TransparencyRecord, Project, Emenda } from '../types';
import { reconstructFileUrl } from '../lib/firebase';
import { 
  FileText, Search, Download, Calendar, ExternalLink, 
  DollarSign, Landmark, TrendingUp, HelpCircle, Eye, 
  ChevronRight, X, Sparkles, FolderOpen, Layers, CheckCircle2,
  Users, ArrowUpRight, ShieldCheck, BookOpen, BarChart3, Building
} from 'lucide-react';

interface TransparencyTabProps {
  records: TransparencyRecord[];
  projects: Project[];
  emendas: Emenda[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
  onNavigateToProject?: (projectId: string) => void;
}

export default function TransparencyTab({ 
  records, 
  projects, 
  emendas,
  onNavigateToProject
}: TransparencyTabProps) {
  // Navigation / Filter States
  const [activeSection, setActiveSection] = useState<'todos' | 'institucional' | 'recursos' | 'relatorios'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('todos');
  const [filterType, setFilterType] = useState<string>('todos');

  // Preview & Download States
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string; mimeType: string } | null>(null);
  const [isDecompressing, setIsDecompressing] = useState<string | null>(null);

  // Helper currency formatter
  const formatBRL = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // 11. INDICADORES GERAIS DA TRANSPARÊNCIA CALCULADOS AUTOMATICAMENTE
  // (Apenas mostrados se calculados a partir dos dados reais e forem > 0)
  const totalRecursosRecebidos = useMemo(() => {
    // Sum from emendas and projects that have received amounts
    const emendasTotal = emendas.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const projTotal = projects.reduce((acc, curr) => {
      // If project has receivedAmount and no emendaId (to avoid double counting with emendas)
      if (curr.receivedAmount && !curr.emendaId) {
        return acc + curr.receivedAmount;
      }
      return acc;
    }, 0);
    const directRecordsReceita = records
      .filter(r => r.type === 'conta' && r.category === 'receita' && !r.fundingSource)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return emendasTotal + projTotal + directRecordsReceita;
  }, [emendas, projects, records]);

  const totalDespesasComprovadas = useMemo(() => {
    // Sum of expenses from records and project proven expenses
    const recordsExpenses = records
      .filter(r => r.type === 'conta' && r.category === 'despesa')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const projExpenses = projects.reduce((acc, curr) => {
      // if project has provenExpenses and no linked expense records to avoid duplicate
      const hasRecords = records.some(r => r.projectLinked === curr.id && r.category === 'despesa');
      if (!hasRecords && curr.provenExpenses) {
        return acc + curr.provenExpenses;
      }
      return acc;
    }, 0);
    return recordsExpenses + projExpenses;
  }, [records, projects]);

  const totalProjetosComPrestacao = useMemo(() => {
    return projects.filter(p => {
      const hasExpenses = (p.provenExpenses && p.provenExpenses > 0);
      const hasDoc = records.some(r => r.projectLinked === p.id && (r.docCategory === 'prestacao_contas' || r.type === 'conta'));
      return hasExpenses || hasDoc;
    }).length;
  }, [projects, records]);

  const totalDocumentosPublicos = useMemo(() => {
    return records.filter(r => r.fileType !== 'photo').length;
  }, [records]);

  // Derive unique years for filter
  const uniqueYears = useMemo(() => {
    const years = new Set<number>();
    records.forEach(r => r.year && years.add(r.year));
    projects.forEach(p => p.year && years.add(p.year));
    emendas.forEach(e => e.year && years.add(e.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [records, projects, emendas]);

  // Institutional Documents (Estatuto, Atas, Balanços Gerais)
  const institutionalRecords = useMemo(() => {
    return records.filter(r => 
      r.fileType !== 'photo' && 
      (r.type === 'estatuto' || r.type === 'ata' || (!r.projectLinked && r.type === 'conta'))
    );
  }, [records]);

  // Reports and Results
  const reportRecords = useMemo(() => {
    return records.filter(r => 
      r.fileType !== 'photo' && 
      (r.docCategory === 'relatorios' || r.title.toLowerCase().includes('relatório'))
    );
  }, [records]);

  // Filtered documents list for the document directory
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (record.fileType === 'photo') return false;
      const matchesSearch = 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = filterYear === 'todos' || record.year.toString() === filterYear;
      const matchesType = filterType === 'todos' || record.type === filterType;
      
      let matchesSection = true;
      if (activeSection === 'institucional') {
        matchesSection = record.type === 'estatuto' || record.type === 'ata' || !record.projectLinked;
      } else if (activeSection === 'relatorios') {
        matchesSection = record.docCategory === 'relatorios' || record.title.toLowerCase().includes('relatório');
      }

      return matchesSearch && matchesYear && matchesType && matchesSection;
    });
  }, [records, searchTerm, filterYear, filterType, activeSection]);

  // File Download / Preview Handling
  const handleFileClick = async (title: string, fileUrl?: string, recordId?: string) => {
    if (!fileUrl || fileUrl === '#') return;

    let targetUrl = fileUrl;
    if (fileUrl.startsWith('chunked|') && recordId) {
      try {
        setIsDecompressing(title);
        targetUrl = await reconstructFileUrl(fileUrl, recordId);
      } catch (err) {
        console.error("Erro ao carregar arquivo:", err);
        alert("Não foi possível carregar o arquivo.");
        setIsDecompressing(null);
        return;
      }
    }

    if (!targetUrl.startsWith('data:')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setIsDecompressing(null);
      return;
    }

    const isCompressed = targetUrl.includes(';base64,GZIP:');
    if (isCompressed) {
      try {
        setIsDecompressing(title);
        const commaIndex = targetUrl.indexOf(',');
        const mimeType = targetUrl.substring(5, targetUrl.indexOf(';'));
        let base64Data = targetUrl.substring(commaIndex + 1);
        while (base64Data.startsWith('GZIP:')) {
          base64Data = base64Data.substring(5);
        }
        
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(bytes);
            controller.close();
          }
        }).pipeThrough(new (window as any).DecompressionStream('gzip'));
        
        const response = new Response(stream);
        const decompressedBlob = await response.blob();
        const typedBlob = new Blob([decompressedBlob], { type: mimeType });
        const blobUrl = URL.createObjectURL(typedBlob);
        
        setPreviewFile({ title, url: blobUrl, mimeType });
      } catch (err) {
        console.error("Erro ao descompactar:", err);
        setPreviewFile({ title, url: '', mimeType: 'unavailable' });
      } finally {
        setIsDecompressing(null);
      }
    } else {
      const mimeType = targetUrl.substring(5, targetUrl.indexOf(';')) || 'application/pdf';
      setPreviewFile({ title, url: targetUrl, mimeType });
    }
  };

  const handleDownloadDirect = async (title: string, fileUrl?: string, recordId?: string) => {
    if (!fileUrl || fileUrl === '#') return;
    let targetUrl = fileUrl;
    if (fileUrl.startsWith('chunked|') && recordId) {
      targetUrl = await reconstructFileUrl(fileUrl, recordId);
    }
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="transparency-view" className="bg-slate-50 min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-950">
            <Landmark className="w-4 h-4 text-indigo-700" />
            Controle Social • Terceiro Setor
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-indigo-950 tracking-tight">
            Transparência IFPP
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Neste espaço, o IFPP disponibiliza informações institucionais, documentos públicos e dados relacionados à execução de seus projetos e recursos.
          </p>
        </div>

        {/* 10. QUATRO ACESSOS PRINCIPAIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Projetos e prestações de contas */}
          <button
            type="button"
            onClick={() => onNavigateToProject ? onNavigateToProject('') : (window.location.hash = '#/projetos')}
            className="text-left p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-950 group-hover:text-white transition-colors">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-950">
                Projetos e prestações de contas
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consulte projetos realizados e a documentação vinculada a cada iniciativa.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-700 group-hover:text-indigo-950">
              <span>Acessar projetos</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 2: Recursos e parcerias */}
          <button
            type="button"
            onClick={() => scrollToSection('origem-recursos')}
            className="text-left p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-950">
                Recursos e parcerias
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consulte informações sobre emendas, editais, convênios, termos, recursos próprios e outras fontes de financiamento cadastradas.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span>Ver fontes e valores</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 3: Documentos institucionais */}
          <button
            type="button"
            onClick={() => {
              setActiveSection('institucional');
              scrollToSection('repositorio-documentos');
            }}
            className="text-left p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-950">
                Documentos institucionais
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estatuto, atas, relatórios e demais documentos institucionais.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-purple-700">
              <span>Consultar arquivos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 4: Relatórios e resultados */}
          <button
            type="button"
            onClick={() => {
              setActiveSection('relatorios');
              scrollToSection('repositorio-documentos');
            }}
            className="text-left p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-950">
                Relatórios e resultados
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Relatórios de atividades, execução e impacto social.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <span>Acessar relatórios</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

        </div>

        {/* 11. INDICADORES GERAIS DA TRANSPARÊNCIA (Apenas se calculados a partir dos dados reais > 0) */}
        {(totalRecursosRecebidos > 0 || totalDespesasComprovadas > 0 || totalProjetosComPrestacao > 0 || totalDocumentosPublicos > 0) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            
            {totalRecursosRecebidos > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recursos recebidos
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block font-mono">
                  {formatBRL(totalRecursosRecebidos)}
                </span>
              </div>
            )}

            {totalDespesasComprovadas > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Despesas comprovadas
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-800 block font-mono">
                  {formatBRL(totalDespesasComprovadas)}
                </span>
              </div>
            )}

            {totalProjetosComPrestacao > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Projetos com prestação de contas
                </span>
                <span className="text-xl sm:text-2xl font-black text-indigo-950 block">
                  {totalProjetosComPrestacao} {totalProjetosComPrestacao === 1 ? 'iniciativa' : 'iniciativas'}
                </span>
              </div>
            )}

            {totalDocumentosPublicos > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Documentos públicos
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                  {totalDocumentosPublicos} {totalDocumentosPublicos === 1 ? 'documento' : 'documentos'}
                </span>
              </div>
            )}

          </div>
        )}

        {/* 12. ORIGEM DOS RECURSOS */}
        <div id="origem-recursos" className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-indigo-950">
              Origem dos Recursos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              Os projetos do IFPP podem ser viabilizados por diferentes fontes de recursos e parcerias. Consulte abaixo as informações disponíveis sobre a origem e a aplicação dos recursos de cada iniciativa.
            </p>
          </div>

          {/* Table / List of Resources */}
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th scope="col" className="px-5 py-3.5 text-left">Projeto vinculado</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Tipo de recurso</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Fonte / Instrumento</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Órgão / Autor</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Ano</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Valor recebido</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Prestação de contas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {projects.map((proj) => {
                    const linkedEmenda = emendas.find(e => e.id === proj.emendaId);
                    const resourceType = proj.fundingSourceType || (linkedEmenda ? 'Emenda Parlamentar' : 'Parceria / Outros');
                    const instrument = proj.fundingInstrument || linkedEmenda?.code || 'Termo de Parceria';
                    const organ = proj.fundingOrgan || linkedEmenda?.organ || 'Não aplicável';
                    const author = proj.fundingAuthor || linkedEmenda?.author;
                    const amountVal = proj.receivedAmount || linkedEmenda?.amount;
                    
                    return (
                      <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => onNavigateToProject ? onNavigateToProject(proj.id) : (window.location.hash = `#/projetos/${proj.id}`)}
                            className="text-left text-indigo-900 hover:text-indigo-600 flex items-center gap-1 font-bold group cursor-pointer"
                            title="Abrir página individual deste projeto"
                          >
                            <span>{proj.title}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {resourceType}
                        </td>

                        <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                          {instrument}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          <div>
                            {organ !== 'Não aplicável' && <span>{organ}</span>}
                            {author && (
                              <span className="block text-[10px] text-slate-400">
                                Autor: {author}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center text-slate-500 font-semibold">
                          {proj.year || linkedEmenda?.year || '-'}
                        </td>

                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                          {amountVal !== undefined ? formatBRL(amountVal) : (
                            <span className="text-slate-400 font-sans font-normal text-[11px]">Em cadastro</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {proj.status === 'concluido' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Concluído
                            </span>
                          ) : proj.status === 'em_andamento' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-100">
                              Em andamento
                            </span>
                          ) : proj.status === 'aprovado' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-100">
                              Aprovado (Aguardando Repasse)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-500 text-[10px]">
                              Planejado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* REPOSITÓRIO GERAL DE DOCUMENTOS PÚBLICOS */}
        <div id="repositorio-documentos" className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-indigo-950">
                Documentos Públicos e Governança
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Estatuto social, atas de conselho, balanços e relatórios de atividades oficiais
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveSection('todos')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeSection === 'todos' 
                    ? 'bg-indigo-950 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('institucional')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeSection === 'institucional' 
                    ? 'bg-indigo-950 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Estatuto & Atas
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('relatorios')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeSection === 'relatorios' 
                    ? 'bg-indigo-950 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Relatórios
              </button>
            </div>
          </div>

          {/* Search bar inside repository */}
          <div className="flex flex-wrap gap-3">
            <div className="relative shrink-0 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar documento pelo título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todos">Todos os Anos</option>
                {uniqueYears.map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of documents */}
          {filteredRecords.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
              {filteredRecords.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-100">
                        {doc.type === 'estatuto' ? 'Estatuto' : doc.type === 'ata' ? 'ATA' : 'Contas / Relatório'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Ano: {doc.year} • {doc.date}
                      </span>
                      {doc.amount && doc.amount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 font-mono">
                          {formatBRL(doc.amount)}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {doc.title}
                    </h4>
                    {doc.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFileClick(doc.title, doc.fileUrl, doc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualizar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadDirect(doc.title, doc.fileUrl, doc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      Baixar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-50">
              Nenhum documento encontrado para os filtros selecionados.
            </div>
          )}

        </div>

      </div>

      {/* Document Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 truncate pr-4">
                {previewFile.title}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto min-h-[350px] flex items-center justify-center bg-slate-50">
              {previewFile.mimeType.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.title} className="max-h-[70vh] object-contain rounded-lg" />
              ) : (
                <iframe src={previewFile.url} title={previewFile.title} className="w-full h-[65vh] rounded-lg border border-slate-200" />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
