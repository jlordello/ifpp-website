import { useState, useEffect } from 'react';
import { ExternalLink, Maximize2, X, ShieldCheck, BarChart3, CheckCircle2 } from 'lucide-react';

interface GovBrTransparencyBannerProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function GovBrTransparencyBanner({
  className = '',
  title = 'Painel Oficial de Propostas e Instrumentos – Transferegov (gov.br)',
  subtitle = 'Demonstrativo oficial extraído do Portal Transferegov (Discricionárias e Legais), apresentando o consolidado de propostas submetidas, índices de aprovação e instrumentos assinados pelo IFPP junto ao Governo Federal.'
}: GovBrTransparencyBannerProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const imageUrl = 'https://i.ibb.co/GvLpVWwC/propostas.jpg';
  const localFallback = '/propostas-transparencia.jpg';
  const externalViewerUrl = 'https://ibb.co/yn1P86Tg';
  const officialPanelUrl = 'https://dd-publico.serpro.gov.br/extensions/painel/DiscricionariasInicio.html?utm_source=chatgpt.com&qlikTicket=cqwXGlQ8sUMaZzva';

  // Handle escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    if (isZoomOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isZoomOpen]);

  return (
    <>
      <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden ${className}`}>
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Dados Oficiais • Transferegov / gov.br
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Discricionárias e Legais
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Visualizar em tamanho grande"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Ampliar Imagem</span>
            </button>
            <a
              href={officialPanelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-950 font-semibold text-xs transition-colors cursor-pointer"
              title="Consultar no Painel Oficial de Discricionárias e Legais (Serpro / gov.br)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-700" />
              <span>Fonte</span>
            </a>
          </div>
        </div>

        {/* Large Image Showcase Section */}
        <div className="p-4 sm:p-8 bg-slate-100/70 flex flex-col items-center">
          <div 
            onClick={() => setIsZoomOpen(true)}
            className="w-full max-w-5xl bg-white rounded-2xl p-2 sm:p-4 border border-slate-200/80 shadow-md group relative cursor-zoom-in transition-all hover:shadow-lg"
          >
            {/* The Image shown in complete, full view */}
            <div className="overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Painel de Propostas Apresentadas e Instrumentos Assinados - Portal gov.br Transferegov"
                className="w-full h-auto max-h-[680px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.008]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== localFallback) {
                    target.src = localFallback;
                  }
                }}
              />
            </div>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-xl bg-slate-900/90 text-white font-bold text-xs backdrop-blur-sm flex items-center gap-2 shadow-lg">
                <Maximize2 className="w-4 h-4 text-emerald-400" />
                Clique para ampliar e ver em tela cheia
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Imagem exibida integralmente sem cortes. Clique sobre a imagem ou no botão para ampliar em tela cheia.
            </span>
          </div>
        </div>

        {/* Highlights Bar summarizing the official screenshot numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-white border-t border-slate-100">
          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Propostas Apresentadas
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-950 block mt-1 font-mono">
              3
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
              66,7% Aprovadas
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Instrumentos Assinados
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-950 block mt-1 font-mono">
              2
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
              66,67% Assinados
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Valor Global
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1 font-mono">
              596 mil
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Em instrumentos
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Valor Liberado
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-1 font-mono">
              400 mil
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Saldo em conta: 2.38 mil
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal (Full Screen View for maximum clarity) */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setIsZoomOpen(false)}
        >
          <div 
            className="relative max-w-6xl w-full max-h-[95vh] flex flex-col items-center bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" />
                <h4 className="font-bold text-sm sm:text-base truncate">
                  Painel de Propostas e Instrumentos – Transferegov (gov.br)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="w-full flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 flex items-center justify-center min-h-[300px]">
              <img
                src={imageUrl}
                alt="Painel de Propostas e Instrumentos - Transferegov gov.br"
                className="max-h-[82vh] max-w-full w-auto object-contain rounded-xl shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== localFallback) {
                    target.src = localFallback;
                  }
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="w-full p-3 sm:px-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Visualização oficial completa em alta resolução
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={officialPanelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <span>Consultar Painel Serpro (Fonte)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
