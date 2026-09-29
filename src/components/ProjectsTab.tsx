import { useState, useEffect, useMemo } from 'react';
import { Project, Emenda, TransparencyRecord, RecordDocCategory } from '../types';
import { reconstructFileUrl } from '../lib/firebase';
import { 
  ArrowLeft, Calendar, MapPin, Users, Sparkles, CheckCircle2, 
  Clock, Image as ImageIcon, FileText, Download, Eye, ExternalLink, 
  Landmark, DollarSign, X, ChevronRight, Layers, Tag, Info, ArrowUpRight,
  Trash2
} from 'lucide-react';

interface ProjectsTabProps {
  projects: Project[];
  emendas: Emenda[];
  records: TransparencyRecord[];
  initialSelectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
  onNavigateToTransparency?: (projectId?: string) => void;
  isAdminLoggedIn?: boolean;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
}

export default function ProjectsTab({ 
  projects, 
  emendas, 
  records,
  initialSelectedProjectId,
  onSelectProject,
  isAdminLoggedIn,
  onUpdateProject,
  onDeleteProject
}: ProjectsTabProps) {
  // Current active project ID for single page view
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialSelectedProjectId || null);
  
  // Lightbox Modal for Gallery Images
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // File Preview Modal
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string; mimeType: string } | null>(null);
  const [isDecompressing, setIsDecompressing] = useState<string | null>(null);

  // Document category filter inside project page
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('todos');

  // Filter for projects list view: 'todos' | 'realizados' | 'aprovados'
  const [projectTabFilter, setProjectTabFilter] = useState<'todos' | 'realizados' | 'aprovados'>('todos');

  // Sync with prop when changed externally
  useEffect(() => {
    if (initialSelectedProjectId !== undefined) {
      setActiveProjectId(initialSelectedProjectId);
    }
  }, [initialSelectedProjectId]);

  // Sync with window hash: e.g. #/projetos/sonhos-da-juventude
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/projetos/')) {
        const pId = hash.replace('#/projetos/', '').trim();
        if (pId) {
          setActiveProjectId(pId);
          onSelectProject?.(pId);
        }
      } else if (hash === '#/projetos' || hash === '#projects') {
        setActiveProjectId(null);
        onSelectProject?.(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [onSelectProject]);

  const selectProject = (id: string | null) => {
    setActiveProjectId(id);
    onSelectProject?.(id);
    if (id) {
      try {
        window.history.pushState(null, '', `#/projetos/${id}`);
      } catch (e) {
        console.warn('History navigation ignored', e);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      try {
        window.history.pushState(null, '', `#/projetos`);
      } catch (e) {
        console.warn('History navigation ignored', e);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Find currently active project
  const currentProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  // Project records (docs and photos)
  const projectRecords = useMemo(() => {
    if (!currentProject) return [];
    return records.filter(r => r.projectLinked === currentProject.id);
  }, [records, currentProject]);

  const isPhotoRecord = (r: TransparencyRecord) => {
    if (r.fileType === 'photo') return true;
    if (!r.fileUrl) return false;
    return r.fileUrl.startsWith('data:image/') || 
           r.fileUrl.includes('.jpg') || 
           r.fileUrl.includes('.png') || 
           r.fileUrl.includes('.jpeg') || 
           r.fileUrl.includes('.webp') ||
           r.fileUrl.startsWith('chunked|image/');
  };

  const projectPhotos = useMemo(() => {
    return projectRecords.filter(isPhotoRecord);
  }, [projectRecords]);

  // Documentos e comprovantes vinculados: exibe todos os registros vinculados ao projeto,
  // incluindo notas fiscais, relatórios, demonstrativos e comprovantes em imagem
  const projectDocs = useMemo(() => {
    return projectRecords;
  }, [projectRecords]);

  // Gallery images from project.gallery and uploaded photo records
  const allGalleryImages = useMemo(() => {
    if (!currentProject) return [];
    const list: string[] = [];
    if (currentProject.gallery && currentProject.gallery.length > 0) {
      list.push(...currentProject.gallery);
    }
    projectPhotos.forEach(r => {
      if (r.fileUrl && !list.includes(r.fileUrl) && r.fileUrl !== '#') {
        list.push(r.fileUrl);
      }
    });
    return list;
  }, [currentProject, projectPhotos]);

  // Helper for status badge
  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Concluído
          </span>
        );
      case 'em_andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Em andamento
          </span>
        );
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ✓ Aprovado
          </span>
        );
      case 'planejado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Planejado
          </span>
        );
      default:
        return null;
    }
  };

  const formatBRL = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Document download / preview logic
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

    // Direct preview for images (base64 or remote URL)
    if (targetUrl.startsWith('data:image/') || targetUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)) {
      setLightboxImage(targetUrl);
      setIsDecompressing(null);
      return;
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
    const isImage = targetUrl.startsWith('data:image/') || targetUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i);
    const extension = isImage ? 'jpg' : 'pdf';
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = `${title.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper to map record category labels
  const getDocCategoryLabel = (docCat?: RecordDocCategory, fallbackType?: string) => {
    switch (docCat) {
      case 'prestacao_contas':
        return 'Prestação de contas';
      case 'relatorios':
        return 'Relatórios';
      case 'notas_fiscais':
        return 'Notas fiscais e comprovantes';
      case 'termos_parceria':
        return 'Termos / Parcerias';
      case 'outros':
        return 'Outros documentos';
      default:
        return fallbackType === 'ata' ? 'Atas / Termos' : fallbackType === 'conta' ? 'Contas' : 'Documento';
    }
  };

  // Filtered documents inside project page
  const filteredProjectDocs = useMemo(() => {
    if (docCategoryFilter === 'todos') return projectDocs;
    return projectDocs.filter(d => d.docCategory === docCategoryFilter);
  }, [projectDocs, docCategoryFilter]);

  // =========================================================================
  // VIEW 1: PÁGINA INDIVIDUAL DO PROJETO (Quando um projeto está selecionado)
  // =========================================================================
  if (currentProject) {
    const linkedEmenda = emendas.find(e => e.id === currentProject.emendaId);
    
    // Check if financial info exists
    const hasFinancialInfo = 
      (currentProject.receivedAmount !== undefined && currentProject.receivedAmount > 0) ||
      (currentProject.provenExpenses !== undefined && currentProject.provenExpenses > 0) ||
      (currentProject.budget !== undefined && currentProject.budget > 0) ||
      linkedEmenda !== undefined;

    const receivedVal = currentProject.receivedAmount || (linkedEmenda ? linkedEmenda.amount : currentProject.budget);
    const provenVal = currentProject.provenExpenses !== undefined 
      ? currentProject.provenExpenses 
      : (currentProject.status === 'concluido' && receivedVal ? receivedVal : undefined);
    const balanceVal = currentProject.balance !== undefined 
      ? currentProject.balance 
      : (receivedVal !== undefined && provenVal !== undefined ? receivedVal - provenVal : 0);

    // Official formalization items (Transferegov, Concedente, Emenda, etc.)
    // Rule: Campos sem conteúdo não devem aparecer
    const formalizationItems = [
      { label: 'Número da Proposta Transferegov', value: currentProject.proposalNumber ? `Proposta nº ${currentProject.proposalNumber}` : null, isMono: true },
      { label: 'Proponente', value: currentProject.proponentName },
      { label: 'CNPJ do Proponente', value: currentProject.proponentCnpj, isMono: true },
      { label: 'Órgão Concedente', value: currentProject.grantingOrgan || currentProject.fundingOrgan },
      { label: 'Programa', value: currentProject.programName },
      { label: 'Objeto Oficial', value: currentProject.officialObject },
      { label: 'Valor Global', value: currentProject.globalValue ? formatBRL(currentProject.globalValue) : null, isMono: true },
      { label: 'Valor de Repasse', value: currentProject.transferValue ? formatBRL(currentProject.transferValue) : null, isMono: true },
      { label: 'Contrapartida', value: currentProject.counterpartValue ? formatBRL(currentProject.counterpartValue) : null, isMono: true },
      { label: 'Número da Emenda', value: currentProject.emendaNumber || linkedEmenda?.code, isMono: true },
      { label: 'Autor / Indicação', value: currentProject.authorIndication || currentProject.fundingAuthor || linkedEmenda?.author },
      { label: 'Número do Processo', value: currentProject.processNumber, isMono: true },
      { label: 'Instrumento / Identificação', value: currentProject.instrumentNumber || currentProject.fundingInstrument, isMono: true },
      { label: 'Fonte do Recurso', value: currentProject.fundingSourceType },
    ].filter(item => Boolean(item.value));

    return (
      <div id="project-detail-view" className="bg-slate-50 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Top Return Navigation Bar */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => selectProject(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-950 hover:bg-slate-100 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-700" />
              Voltar para Projetos
            </button>
            <div className="flex items-center gap-3">
              {isAdminLoggedIn && onDeleteProject && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Deseja realmente excluir a iniciativa "${currentProject.title}"? Esta ação removerá o projeto do portal.`)) {
                      onDeleteProject(currentProject.id);
                      selectProject(null);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="Excluir Iniciativa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Iniciativa</span>
                </button>
              )}
              <div className="text-xs text-slate-400 font-medium hidden sm:block">
                IFPP • Nossas Ações
              </div>
            </div>
          </div>

          {/* 1. CABEÇALHO */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Project Hero Image */}
            {currentProject.mainImage && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-900 overflow-hidden">
                <img 
                  src={currentProject.mainImage} 
                  alt={currentProject.title} 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                
                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {currentProject.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-indigo-950 backdrop-blur-md shadow-xs">
                      {currentProject.category}
                    </span>
                  )}
                  {currentProject.year && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md">
                      {currentProject.year}
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  {getStatusBadge(currentProject.status)}
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                    {currentProject.title}
                  </h1>
                  {currentProject.location && (
                    <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-200 font-medium">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      {currentProject.location}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Header Body Information */}
            <div className="p-6 sm:p-8 space-y-6">
              {!currentProject.mainImage && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      {currentProject.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-100">
                          {currentProject.category}
                        </span>
                      )}
                      {currentProject.year && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {currentProject.year}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(currentProject.status)}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentProject.title}
                  </h1>
                  {currentProject.location && (
                    <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      {currentProject.location}
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {currentProject.tags && currentProject.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentProject.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Short summary banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
                <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                  {currentProject.description}
                </p>
              </div>

              {/* Informações Institucionais e Proposta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
                {currentProject.category && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-500 font-medium block text-[11px]">Área / Categoria</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{currentProject.category}</span>
                  </div>
                )}
                {currentProject.year && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-500 font-medium block text-[11px]">Ano de Referência</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{currentProject.year}</span>
                  </div>
                )}
                {currentProject.proposalNumber && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-emerald-900/80 font-medium block text-[11px]">Proposta Transferegov</span>
                    <span className="font-mono font-extrabold text-emerald-950 mt-0.5 block">Nº {currentProject.proposalNumber}</span>
                  </div>
                )}
                {currentProject.proponentName && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 sm:col-span-2">
                    <span className="text-slate-500 font-medium block text-[11px]">Proponente</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{currentProject.proponentName}</span>
                  </div>
                )}
                {currentProject.proponentCnpj && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-500 font-medium block text-[11px]">CNPJ do Proponente</span>
                    <span className="font-mono font-bold text-slate-800 mt-0.5 block">{currentProject.proponentCnpj}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. SOBRE O PROJETO */}
          {(currentProject.fullDescription || currentProject.description) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-indigo-900 inline-block" />
                Sobre o Projeto
              </h2>
              <p className="text-xs sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {currentProject.fullDescription || currentProject.description}
              </p>
            </div>
          )}

          {/* 2.1 OBJETIVOS E METAS (quando cadastrados) */}
          {currentProject.goalsAndObjectives && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-indigo-600 inline-block" />
                Objetivos e Metas
              </h2>
              <p className="text-xs sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {currentProject.goalsAndObjectives}
              </p>
            </div>
          )}

          {/* 2.2 PÚBLICO BENEFICIÁRIO (quando cadastrado) */}
          {(currentProject.targetAudience || currentProject.participantsCount) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-purple-600 inline-block" />
                Público Beneficiário
              </h2>
              {currentProject.targetAudience && (
                <p className="text-xs sm:text-base text-slate-700 leading-relaxed">
                  {currentProject.targetAudience}
                </p>
              )}
              {currentProject.participantsCount && (
                <p className="text-xs sm:text-sm font-semibold text-slate-900">
                  Participantes previstos / atendidos: {currentProject.participantsCount}
                </p>
              )}
            </div>
          )}

          {/* 3. IMPACTO (Indicadores Reais) */}
          {currentProject.indicators && currentProject.indicators.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 rounded-full bg-emerald-600 inline-block" />
                  Resultados e Indicadores Reais
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Métricas comprovadas alcançadas durante as atividades deste projeto
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {currentProject.indicators.map((ind, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-indigo-100 transition-colors flex flex-col justify-center items-center text-center space-y-1"
                  >
                    <span className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                      {ind.value}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-tight">
                      {ind.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. TERRITÓRIOS E ABRANGÊNCIA */}
          {((currentProject.territories && currentProject.territories.length > 0) || currentProject.executionLocations) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 rounded-full bg-rose-500 inline-block" />
                  Territórios e Localidades Atendidas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Espaços, cidades e comunidades onde as ações foram implementadas
                </p>
              </div>

              {currentProject.executionLocations && (
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  {currentProject.executionLocations}
                </p>
              )}

              {currentProject.territories && currentProject.territories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentProject.territories.map((place, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 font-medium"
                    >
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{place}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. GALERIA DE FOTOS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 rounded-full bg-amber-500 inline-block" />
                  Galeria de Fotografias
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Registros fotográficos das oficinas, eventos e atividades realizadas {allGalleryImages.length > 0 && `(${allGalleryImages.length} ${allGalleryImages.length === 1 ? 'foto' : 'fotos'})`}
                </p>
              </div>
            </div>

            {allGalleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {allGalleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 hover:opacity-95 transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxImage(imgUrl)}
                      className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Registro fotográfico ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-6 h-6 drop-shadow-md" />
                      </div>
                    </button>
                    {isAdminLoggedIn && onUpdateProject && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Deseja realmente excluir esta foto da galeria?")) {
                            const nextGallery = (currentProject.gallery || []).filter(u => u !== imgUrl);
                            onUpdateProject({
                              ...currentProject,
                              gallery: nextGallery
                            });
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white shadow-md z-20 transition-all cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
                        title="Excluir foto da galeria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Espaço preparado para registros fotográficos deste projeto</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  Fotos de treinos, atividades e eventos serão adicionadas e exibidas aqui à medida que as ações forem realizadas nos territórios.
                </p>
              </div>
            )}
          </div>

          {/* 6. TRANSPARÊNCIA E PRESTAÇÃO DE CONTAS DENTRO DO PROJETO */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-indigo-600 inline-block" />
                Transparência e Prestação de Contas
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Informações financeiras, dados da proposta e instrumentos vinculados a esta iniciativa
              </p>
            </div>

            {/* Metadados Oficiais / Transferegov / Instrumentos (Apenas campos com conteúdo real) */}
            {formalizationItems.length > 0 && (
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 divide-y divide-slate-200/60 text-xs">
                {formalizationItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-500 font-semibold">{item.label}:</span>
                    <span className={`text-slate-900 font-bold ${item.isMono ? 'font-mono' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Execução Financeira (Recurso recebido, despesas comprovadas e saldo quando houver dados reais) */}
            {hasFinancialInfo ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <span className="text-[11px] font-bold text-indigo-900/70 uppercase tracking-wider block">
                      Recurso recebido
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-indigo-950 block mt-1 font-mono">
                      {receivedVal !== undefined ? formatBRL(receivedVal) : 'Não informado'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-900/70 uppercase tracking-wider block">
                      Despesas comprovadas
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-emerald-900 block mt-1 font-mono">
                      {provenVal !== undefined ? formatBRL(provenVal) : 'Em comprovação'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Saldo
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-slate-800 block mt-1 font-mono">
                      {formatBRL(balanceVal)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-600 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">
                  {currentProject.status === 'aprovado'
                    ? 'Projeto aprovado. As informações de execução e prestação de contas serão publicadas nesta página conforme forem disponibilizadas.'
                    : (currentProject.financialStatusNote || 'Informações financeiras e documentos de prestação de contas ainda não disponibilizados.')
                  }
                </span>
              </div>
            )}

            {/* 7. DOCUMENTOS E COMPROVANTES DO PROJETO (Somente exibido quando houver documentos reais cadastrados) */}
            {projectDocs.length > 0 && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Documentos e comprovantes vinculados
                  </h3>
                  
                  {/* Simple category filter (only shown if there are multiple documents) */}
                  {projectDocs.length > 3 && (
                    <div className="flex items-center gap-2">
                      <select
                        value={docCategoryFilter}
                        onChange={(e) => setDocCategoryFilter(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="todos">Todos os Documentos</option>
                        <option value="prestacao_contas">Prestação de contas</option>
                        <option value="relatorios">Relatórios</option>
                        <option value="notas_fiscais">Notas fiscais e comprovantes</option>
                        <option value="termos_parceria">Termos / Parcerias</option>
                        <option value="outros">Outros documentos</option>
                      </select>
                    </div>
                  )}
                </div>

                {filteredProjectDocs.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                    {filteredProjectDocs.map((doc) => {
                      const isImg = isPhotoRecord(doc);
                      return (
                        <div 
                          key={doc.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                            {isImg && doc.fileUrl && doc.fileUrl !== '#' ? (
                              <div 
                                onClick={() => handleFileClick(doc.title, doc.fileUrl, doc.id)}
                                className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 cursor-pointer hover:opacity-90 relative group"
                                title="Clique para visualizar imagem do comprovante"
                              >
                                <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                                {isImg ? <ImageIcon className="w-5 h-5 text-indigo-600" /> : <FileText className="w-5 h-5 text-slate-600" />}
                              </div>
                            )}

                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-100">
                                  {getDocCategoryLabel(doc.docCategory, doc.type)}
                                </span>
                                {isImg && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3 text-emerald-600" />
                                    Comprovante em Imagem
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {doc.date}
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
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                    Nenhum documento específico cadastrado nesta categoria até o momento.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Back Button */}
          <div className="pt-4 text-center">
            <button
              onClick={() => selectProject(null)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-950 text-white font-bold text-xs sm:text-sm hover:bg-indigo-900 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à Lista de Projetos
            </button>
          </div>

        </div>

        {/* Lightbox Modal for Gallery Images */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title="Fechar visualização"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={lightboxImage} 
                alt="Fotografia do projeto em alta resolução" 
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
          </div>
        )}

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

  // =========================================================================
  // VIEW 2: PÁGINA "NOSSAS AÇÕES" (LISTA DE PROJETOS)
  // =========================================================================
  return (
    <div id="projects-view" className="bg-slate-50 min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Page Title & Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-950">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Nossas Ações
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-indigo-950 tracking-tight">
            Projetos
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Conheça iniciativas do IFPP nas áreas de formação, cultura, educação e desenvolvimento social.
          </p>
        </div>

        {/* Filter Navigation Bar: Todos | Realizados | Aprovados */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/60 gap-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setProjectTabFilter('todos')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                projectTabFilter === 'todos'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Todos</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                projectTabFilter === 'todos' ? 'bg-indigo-100 text-indigo-950 font-bold' : 'bg-slate-300/60 text-slate-700'
              }`}>
                {projects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProjectTabFilter('realizados')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                projectTabFilter === 'realizados'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Realizados</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                projectTabFilter === 'realizados' ? 'bg-indigo-100 text-indigo-950 font-bold' : 'bg-slate-300/60 text-slate-700'
              }`}>
                {projects.filter(p => p.status === 'concluido' || p.status === 'em_andamento').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProjectTabFilter('aprovados')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                projectTabFilter === 'aprovados'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aprovados</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                projectTabFilter === 'aprovados' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-300/60 text-slate-700'
              }`}>
                {projects.filter(p => p.status === 'aprovado').length}
              </span>
            </button>
          </div>
        </div>

        {/* Project Cards Grid (1 on mobile, 2 on tablet, up to 3 on desktop) */}
        {(() => {
          const filteredProjects = projects.filter(p => {
            if (projectTabFilter === 'todos') return true;
            if (projectTabFilter === 'aprovados') return p.status === 'aprovado';
            if (projectTabFilter === 'realizados') {
              return p.status === 'concluido' || p.status === 'em_andamento';
            }
            return true;
          });

          if (filteredProjects.length === 0) {
            return (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
                Nenhum projeto encontrado nesta categoria no momento.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProjects.map((p) => {
                const pRecords = records.filter(r => r.projectLinked === p.id);
                const pPhotos = pRecords.filter(isPhotoRecord);

                // Gallery count or photos count
                const totalPhotos = (p.gallery?.length || 0) + (p.mainImage ? 1 : 0) + pPhotos.length;
                const totalDocs = pRecords.length;

                return (
                  <div 
                    key={p.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Card Main Photo */}
                      <div className="relative w-full aspect-16/10 bg-slate-100 overflow-hidden">
                        {p.mainImage ? (
                          <img 
                            src={p.mainImage} 
                            alt={p.title} 
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center text-white/50">
                            <ImageIcon className="w-10 h-10" />
                          </div>
                        )}

                        {/* Status Badge overlay */}
                        <div className="absolute top-3 right-3 shadow-xs">
                          {getStatusBadge(p.status)}
                        </div>

                        {/* Category pill */}
                        {p.category && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-indigo-950 backdrop-blur-md shadow-xs">
                              {p.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6 space-y-3">
                        
                        {/* Year & Location Row */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          {p.location ? (
                            <span className="flex items-center gap-1 truncate font-medium">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate">{p.location}</span>
                            </span>
                          ) : <span />}
                          {p.year && (
                            <span className="font-semibold text-slate-400 shrink-0">
                              {p.year}
                            </span>
                          )}
                        </div>

                        {/* Project Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-950 transition-colors line-clamp-2">
                          {p.title}
                        </h3>

                        {/* Proposal Number Badge (quando houver número de proposta oficial) */}
                        {p.proposalNumber && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              Proposta nº {p.proposalNumber}
                            </span>
                          </div>
                        )}

                        {/* Short Summary (3 a 4 linhas) */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {p.description}
                        </p>

                        {/* Main Indicators preview chips */}
                        {p.indicators && p.indicators.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {p.indicators.slice(0, 3).map((ind, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50/70 text-indigo-900 border border-indigo-100/60"
                              >
                                <span className="text-indigo-700">{ind.value}</span> {ind.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Counters: Photos & Docs (Ocultado em projetos aprovados sem execução financeira) */}
                        {p.status !== 'aprovado' && (totalPhotos > 0 || totalDocs > 0) && (
                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                            {totalPhotos > 0 && (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                {totalPhotos} {totalPhotos === 1 ? 'foto' : 'fotos'}
                              </span>
                            )}
                            {totalPhotos > 0 && totalDocs > 0 && (
                              <span>•</span>
                            )}
                            {totalDocs > 0 && (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                {totalDocs} {totalDocs === 1 ? 'documento' : 'documentos'}
                              </span>
                            )}
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Primary Button */}
                    <div className="p-5 sm:p-6 pt-0">
                      <button
                        type="button"
                        onClick={() => selectProject(p.id)}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs group-hover:shadow-md cursor-pointer"
                      >
                        <span>Ver projeto e transparência</span>
                        <ArrowUpRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
