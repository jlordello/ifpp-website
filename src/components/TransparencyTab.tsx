import { useState } from 'react';
import { TransparencyRecord, Project, Emenda } from '../types';
import { reconstructFileUrl } from '../lib/firebase';
import { 
  FileText, Search, Filter, Download, Calendar, ExternalLink, 
  DollarSign, Landmark, TrendingUp, HelpCircle, Eye, ChevronRight
} from 'lucide-react';

interface TransparencyTabProps {
  records: TransparencyRecord[];
  projects: Project[];
  emendas: Emenda[];
}

function getDownloadFileName(title: string, dataUrl: string): string {
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_') || 'documento';
  let extension = '.pdf'; // default
  
  if (dataUrl && (dataUrl.startsWith('data:') || dataUrl.startsWith('chunked|'))) {
    let mimeType = '';
    if (dataUrl.startsWith('chunked|')) {
      const parts = dataUrl.split('|');
      mimeType = parts[1];
    } else {
      const match = dataUrl.match(/^data:(.*?);/);
      if (match && match[1]) {
        mimeType = match[1];
      }
    }
    
    if (mimeType) {
      if (mimeType.includes('pdf')) {
        extension = '.pdf';
      } else if (mimeType.includes('png')) {
        extension = '.png';
      } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
        extension = '.jpg';
      } else if (mimeType.includes('word') || mimeType.includes('msword')) {
        extension = '.docx';
      } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
        extension = '.xlsx';
      } else if (mimeType.includes('plain')) {
        extension = '.txt';
      }
    }
  }
  return `${cleanTitle}${extension}`;
}

export default function TransparencyTab({ records, projects, emendas }: TransparencyTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterYear, setFilterYear] = useState<string>('todos');
  const [selectedRecord, setSelectedRecord] = useState<TransparencyRecord | null>(null);
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);
  const [isDecompressing, setIsDecompressing] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string; mimeType: string } | null>(null);

  const closePreview = () => {
    if (previewFile) {
      if (previewFile.url.startsWith('blob:')) {
        URL.revokeObjectURL(previewFile.url);
      }
      setPreviewFile(null);
    }
  };

  const handleFileClick = async (title: string, fileUrl: string, recordId?: string) => {
    if (!fileUrl || fileUrl === '#') return;

    let targetUrl = fileUrl;
    if (fileUrl.startsWith('chunked|') && recordId) {
      try {
        setIsDecompressing(title);
        targetUrl = await reconstructFileUrl(fileUrl, recordId);
      } catch (err) {
        console.error("Erro ao carregar partes do arquivo:", err);
        alert("Não foi possível baixar o arquivo do banco de dados.");
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
        
        // Convert base64 to binary bytes
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Decompress Gzip
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
        
        // Set preview file with Blob URL
        setPreviewFile({ title, url: blobUrl, mimeType });
      } catch (err) {
        console.error("Erro na descompactação:", err);
        
        try {
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
          const typedBlob = new Blob([bytes], { type: mimeType });
          const blobUrl = URL.createObjectURL(typedBlob);
          setPreviewFile({ title, url: blobUrl, mimeType });
        } catch (blobErr) {
          console.error("Erro de fallback para blob:", blobErr);
          setPreviewFile({ title, url: '', mimeType: 'unavailable' });
        }
      } finally {
        setIsDecompressing(null);
      }
    } else {
      try {
        const commaIndex = targetUrl.indexOf(',');
        if (commaIndex !== -1) {
          const mimeType = targetUrl.substring(5, targetUrl.indexOf(';'));
          const base64Data = targetUrl.substring(commaIndex + 1);
          
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const typedBlob = new Blob([bytes], { type: mimeType });
          const blobUrl = URL.createObjectURL(typedBlob);
          
          setPreviewFile({ title, url: blobUrl, mimeType });
        } else {
          throw new Error("Formato data URL inválido");
        }
      } catch (err) {
        console.error("Erro ao converter data URL em Blob, tentando visualização direta de dados:", err);
        setPreviewFile({ title, url: '', mimeType: 'unavailable' });
      } finally {
        setIsDecompressing(null);
      }
    }
  };

  const triggerDownloadNotification = (title: string) => {
    setDownloadNotification(`Iniciando download do documento "${title}" (Simulação PDF oficial assinado)`);
    setTimeout(() => {
      setDownloadNotification(null);
    }, 4500);
  };

  // Derive unique years from records for the filter dropdown
  const uniqueYears = Array.from(new Set(records.map(r => r.year))).sort((a, b) => b - a);

  // Filter records based on search and selected options
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'todos' || record.type === filterType;
    const matchesYear = filterYear === 'todos' || record.year.toString() === filterYear;
    return matchesSearch && matchesType && matchesYear;
  });

  // Calculate high level summaries
  const totalEmendasValue = emendas.reduce((acc, curr) => acc + curr.amount, 0);
  const totalContasDespesas = records
    .filter(r => r.type === 'conta' && r.category === 'despesa')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalContasReceitas = records
    .filter(r => r.type === 'conta' && r.category === 'receita')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Format money helper
  const formatBRL = (value?: number) => {
    if (value === undefined) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getRecordBadge = (type: string) => {
    switch (type) {
      case 'estatuto':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-100">Estatuto</span>;
      case 'ata':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100">ATA</span>;
      case 'conta':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">Contas</span>;
      default:
        return null;
    }
  };

  return (
    <div id="transparency-view" className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Block */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-950">
            <Landmark className="w-4 h-4 text-indigo-600" />
            Lei de Acesso à Informação • Controle Social Ativo
          </div>
          <h1 className="text-xl sm:text-4xl font-extrabold text-indigo-950 tracking-tight">
            Portal da Transparência e Prestação de Contas
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-3xl">
            Em conformidade com as diretrizes do Terceiro Setor e compromisso ético do IFPP, disponibilizamos todos os balanços, as atas de governança, o estatuto registrado em cartório e o detalhamento das emendas parlamentares captadas por projeto.
          </p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Total de Emendas Recebidas</span>
              <span className="text-lg sm:text-3xl font-black text-slate-900 block mt-1">
                {formatBRL(totalEmendasValue)}
              </span>
              <p className="text-xs text-slate-500 mt-2">Valores oficiais aplicados desde 2021 em cursos e eventos</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Prestado de Despesas</span>
              <span className="text-lg sm:text-3xl font-black text-slate-900 block mt-1 text-indigo-950">
                {formatBRL(totalContasDespesas)}
              </span>
              <p className="text-xs text-slate-500 mt-2">Prestação de contas aprovadas pelo conselho gestor</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Documentos Públicos</span>
              <span className="text-lg sm:text-3xl font-black text-slate-900 block mt-1">
                {records.length} Ativos
              </span>
              <p className="text-xs text-slate-500 mt-2">Contas, atas ordinárias e estatutos vigentes</p>
            </div>
          </div>

        </div>

        {/* Interactive Emenda-to-Project Matrix */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-950 to-indigo-900 text-white">
            <h3 className="text-lg font-bold tracking-tight">Origem e Destinação de Recursos (Emendas Parlamentares)</h3>
            <p className="text-xs text-indigo-200 mt-1">
              Cada curso, oficina ou evento promovido pelo IFPP é viabilizado por emendas federais, estaduais ou municipais. Veja a prestação cruzada:
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Código da Emenda</th>
                  <th className="px-6 py-4">Autor do Repasse</th>
                  <th className="px-6 py-4">Projeto / Curso Vinculado</th>
                  <th className="px-6 py-4 text-right">Valor Alocado</th>
                  <th className="px-6 py-4 text-center">Status no IFPP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emendas.map((emenda) => {
                  const linkedProj = projects.find(p => p.id === emenda.allocatedProjectId);
                  return (
                    <tr key={emenda.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-900">
                        {emenda.code}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {emenda.author}
                      </td>
                      <td className="px-6 py-4">
                        {linkedProj ? (
                          <div>
                            <span className="block font-semibold text-slate-900">{linkedProj.title}</span>
                            <span className="block text-xs text-slate-500 capitalize">{linkedProj.type} • {linkedProj.year}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">Aguardando vinculação</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                        {formatBRL(emenda.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {linkedProj?.status === 'concluido' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-medium">
                            Concluído e Prestado
                          </span>
                        ) : linkedProj?.status === 'em_andamento' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-amber-800 text-xs font-medium">
                            Execução Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs font-medium">
                            Não Atribuído
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

        {/* Directory & Filters Block */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-indigo-950">Repositório Geral de Documentos</h3>
              <p className="text-xs text-slate-500 mt-1">Busque ou filtre ATAs, Balancetes e o Estatuto Social</p>
            </div>
            
            {/* Control Filters */}
            <div className="flex flex-wrap gap-2">
              
              {/* Text Search */}
              <div className="relative shrink-0 w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar pelo título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                />
              </div>

              {/* Type Filter */}
              <div className="relative shrink-0">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="estatuto">Apenas Estatuto</option>
                  <option value="ata">Apenas ATAs</option>
                  <option value="conta">Apenas Contas</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="relative shrink-0">
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="todos">Todos os Anos</option>
                  {uniqueYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Records Grid */}
          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => {
                const linkedProj = projects.find(p => p.id === record.projectLinked);
                const linkedEmenda = emendas.find(e => e.id === record.fundingSource);

                return (
                  <div 
                    key={record.id} 
                    className="flex flex-col justify-between bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-slate-100 transition-all p-5"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-4">
                        {getRecordBadge(record.type)}
                        <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.date}
                        </span>
                      </div>

                      <h4 className="font-bold text-indigo-950 text-sm leading-snug line-clamp-2">
                        {record.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {record.description}
                      </p>

                      {/* Display linked info if accounts */}
                      {record.type === 'conta' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                          {record.amount !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Valor Auditado:</span>
                              <span className={`font-mono font-bold ${record.category === 'despesa' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {record.category === 'despesa' ? '-' : '+'} {formatBRL(record.amount)}
                              </span>
                            </div>
                          )}
                          {linkedProj && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Projeto Vinculado:</span>
                              <span className="font-semibold text-slate-700 text-right max-w-[150px] truncate">
                                {linkedProj.title}
                              </span>
                            </div>
                          )}
                          {linkedEmenda && (
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Emenda Suporte:</span>
                              <span className="font-mono text-indigo-900 font-semibold text-right">
                                {linkedEmenda.code}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 flex gap-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex-1 text-center py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Detalhes
                      </button>
                      {record.fileUrl && record.fileUrl !== '#' ? (
                        <button
                          onClick={() => handleFileClick(record.title, record.fileUrl, record.id)}
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer flex items-center justify-center relative min-w-[36px]"
                          title="Visualizar / Baixar Documento"
                          disabled={isDecompressing === record.title}
                        >
                          {isDecompressing === record.title ? (
                            <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerDownloadNotification(record.title)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                          title="Baixar PDF Assinado (Simulação)"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 mt-4">Nenhum registro encontrado</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
                Experimente mudar os filtros selecionados ou digite termos diferentes na caixa de busca.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Document View Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-50 text-indigo-900 text-xs font-semibold uppercase tracking-wider mb-2">
                  Visualização Digital • {selectedRecord.type}
                </span>
                <h3 className="text-xl font-bold text-indigo-950 tracking-tight leading-snug">
                  {selectedRecord.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
              >
                fechar
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-600 border-t border-b border-slate-100 py-6">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Descrição Completa</span>
                <p className="mt-1 text-slate-700 text-sm">
                  {selectedRecord.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Data de Registro</span>
                  <p className="mt-0.5 text-slate-900 font-medium font-mono text-xs">{selectedRecord.date}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Exercício/Ano</span>
                  <p className="mt-0.5 text-slate-900 font-semibold">{selectedRecord.year}</p>
                </div>
              </div>

              {selectedRecord.type === 'conta' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4 space-y-3">
                  <span className="block text-xs font-bold text-indigo-950 uppercase tracking-wide">Metadados de Auditoria Financeira</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Total Auditado:</span>
                      <span className="block text-base font-bold text-slate-900 font-mono">
                        {formatBRL(selectedRecord.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Categoria Contábil:</span>
                      <span className="block font-semibold text-slate-900 capitalize mt-0.5">
                        {selectedRecord.category === 'despesa' ? 'Saída de Caixa (Despesa)' : 'Entrada (Receita/Aporte)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {selectedRecord.fileUrl && selectedRecord.fileUrl !== '#' ? (
                <button
                  onClick={() => handleFileClick(selectedRecord.title, selectedRecord.fileUrl, selectedRecord.id)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer text-center disabled:opacity-75"
                  disabled={isDecompressing === selectedRecord.title}
                >
                  {isDecompressing === selectedRecord.title ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Descompactando arquivo...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Visualizar / Baixar Documento
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => triggerDownloadNotification(selectedRecord.title)}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF Assinado (Simulação)
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="py-3 px-6 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors border border-slate-100 cursor-pointer"
              >
                Voltar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Visualizador de Documentos Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-6xl h-full sm:h-[90vh] flex flex-col overflow-hidden border-t sm:border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-3 sm:p-4 bg-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 max-w-[45%] sm:max-w-[70%]">
                <FileText className="w-5 h-5 text-indigo-200 shrink-0" />
                <h3 className="font-bold text-[11px] sm:text-sm truncate" title={previewFile.title}>
                  Visualizando: {previewFile.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    window.open(previewFile.url, '_blank');
                  }}
                  className="px-2 sm:px-3 py-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer text-indigo-100"
                  title="Abrir em Nova Aba"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nova Aba</span>
                </button>

                <button
                  onClick={() => {
                    const filename = getDownloadFileName(previewFile.title, previewFile.url);
                    const link = document.createElement('a');
                    link.href = previewFile.url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer text-white"
                  title="Baixar Arquivo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar</span>
                </button>

                <button
                  onClick={closePreview}
                  className="py-1.5 px-2.5 sm:px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-[10px] sm:text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 p-2 sm:p-4 bg-slate-100 overflow-auto flex flex-col justify-center items-center">
              {previewFile.mimeType.includes('pdf') ? (
                <div className="w-full h-full flex flex-col">
                  {/* Warning message for mobile browsers */}
                  <div className="sm:hidden mb-1.5 text-[10px] text-indigo-900 bg-indigo-50 p-1.5 rounded border border-indigo-100 flex items-center gap-1 shrink-0">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Se o PDF não carregar abaixo, clique no botão "Nova Aba".</span>
                  </div>
                  <iframe
                    src={previewFile.url}
                    className="w-full flex-1 rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-inner min-h-[60vh]"
                    title="Visualizador de PDF"
                  />
                </div>
              ) : previewFile.mimeType.startsWith('image/') ? (
                <div className="max-w-full max-h-full flex items-center justify-center p-1 sm:p-2">
                  <img
                    src={previewFile.url}
                    alt={previewFile.title}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md bg-white border border-slate-200"
                  />
                </div>
              ) : (
                <div className="text-center p-6 sm:p-8 max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm mx-4">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-800 text-sm mb-2">Visualização Indisponível</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    A visualização direta está indisponível para este tipo de documento ({previewFile.mimeType}). 
                    Por favor, utilize as opções de download para obter o arquivo completo.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        window.open(previewFile.url, '_blank');
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir em Nova Aba
                    </button>
                    <button
                      onClick={() => {
                        const filename = getDownloadFileName(previewFile.title, previewFile.url);
                        const link = document.createElement('a');
                        link.href = previewFile.url;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Baixar Documento
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 text-xs shrink-0">
              <button
                onClick={closePreview}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
              >
                Voltar para o Repositório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {downloadNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <p className="font-medium leading-normal">{downloadNotification}</p>
        </div>
      )}

    </div>
  );
}
