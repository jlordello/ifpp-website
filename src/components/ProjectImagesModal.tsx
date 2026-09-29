import { useState, useEffect, ChangeEvent } from 'react';
import { Project } from '../types';
import { processImageFile } from '../lib/imageUtils';
import { 
  X, Image as ImageIcon, UploadCloud, Trash2, Edit2, 
  Plus, Check, Eye, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';

interface ProjectImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSaveProject: (updatedProject: Project) => void;
}

export default function ProjectImagesModal({
  isOpen,
  onClose,
  project,
  onSaveProject
}: ProjectImagesModalProps) {
  const [mainImage, setMainImage] = useState<string>('');
  const [mainImageUrlInput, setMainImageUrlInput] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState<string>('');
  
  // State for replacing an individual gallery photo
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [replaceUrlInput, setReplaceUrlInput] = useState<string>('');

  // Processing states & errors
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Sync state with project prop
  useEffect(() => {
    if (project) {
      setMainImage(project.mainImage || '');
      setMainImageUrlInput(project.mainImage && !project.mainImage.startsWith('data:') ? project.mainImage : '');
      setGallery(project.gallery ? [...project.gallery] : []);
      setEditingIndex(null);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  // Handle local file upload for Main Image
  const handleUploadMainImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      setMainImage(dataUrl);
      setMainImageUrlInput('');
      setSuccessMessage('Foto principal atualizada com sucesso!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Handle URL change for Main Image
  const handleApplyMainImageUrl = () => {
    if (!mainImageUrlInput.trim()) return;
    setMainImage(mainImageUrlInput.trim());
    setSuccessMessage('Foto principal alterada via URL.');
  };

  // Remove Main Image
  const handleRemoveMainImage = () => {
    setMainImage('');
    setMainImageUrlInput('');
    setSuccessMessage('Foto principal removida.');
  };

  // Handle local file upload for New Gallery Photo
  const handleUploadGalleryPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      setGallery(prev => [...prev, dataUrl]);
      setSuccessMessage('Nova foto adicionada à galeria!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao adicionar foto.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Add gallery photo via URL
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setGallery(prev => [...prev, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
    setSuccessMessage('Foto adicionada à galeria!');
  };

  // Replace an existing gallery photo via file upload
  const handleReplaceGalleryPhoto = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      setGallery(prev => {
        const next = [...prev];
        next[index] = dataUrl;
        return next;
      });
      setEditingIndex(null);
      setSuccessMessage(`Foto #${index + 1} alterada com sucesso!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao alterar foto.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Replace gallery photo via URL
  const handleApplyReplaceUrl = (index: number) => {
    if (!replaceUrlInput.trim()) return;
    setGallery(prev => {
      const next = [...prev];
      next[index] = replaceUrlInput.trim();
      return next;
    });
    setEditingIndex(null);
    setReplaceUrlInput('');
    setSuccessMessage(`Foto #${index + 1} alterada com sucesso!`);
  };

  // Remove photo from gallery
  const handleRemoveGalleryPhoto = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    setSuccessMessage('Foto excluída da galeria.');
  };

  // Save all changes to the project
  const handleSaveAll = () => {
    const updated: Project = {
      ...project,
      mainImage: mainImage.trim() || undefined,
      gallery: gallery.length > 0 ? gallery : undefined
    };
    onSaveProject(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold truncate">
                Gerenciar Imagens do Projeto
              </h3>
              <p className="text-xs text-slate-300 truncate">
                {project.title} • {project.category || project.type.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status alerts */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </span>
            <button 
              type="button" 
              onClick={() => setSuccessMessage(null)} 
              className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* ========================================================
              SEÇÃO 1: FOTO PRINCIPAL (CAPA DO PROJETO)
              ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-indigo-600 inline-block" />
                  Foto Principal (Capa / Destaque)
                </h4>
                <p className="text-xs text-slate-500">
                  Esta foto aparece nos cartões da página de Projetos e no cabeçalho principal.
                </p>
              </div>
              {mainImage && (
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Excluir Foto Principal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Foto
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Image Preview Box */}
              <div className="sm:col-span-6">
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  {mainImage ? (
                    <>
                      <img 
                        src={mainImage} 
                        alt="Foto Principal do Projeto" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewZoomImage(mainImage)}
                          className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Ampliar
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-bold text-slate-600">Sem Foto Principal</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Faça o upload de uma imagem ou informe uma URL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload & Change Controls */}
              <div className="sm:col-span-6 space-y-3 text-xs">
                {/* File Upload Button */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    Upload de Imagem (do computador ou celular)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer transition-colors text-indigo-900 font-semibold">
                    <UploadCloud className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{isProcessing ? 'Processando imagem...' : 'Selecionar Nova Imagem'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isProcessing}
                      onChange={handleUploadMainImage}
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Formatos JPG, PNG ou WebP. Redimensionamento e otimização automáticos.
                  </p>
                </div>

                {/* External URL alternative */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-slate-600 font-bold mb-1">
                    Ou informe o Link/URL da Imagem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={mainImageUrlInput}
                      onChange={(e) => setMainImageUrlInput(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyMainImageUrl}
                      className="px-3 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              SEÇÃO 2: GALERIA DE FOTOS DO PROJETO (gallery)
              ======================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-amber-500 inline-block" />
                  Galeria de Fotografias ({gallery.length} {gallery.length === 1 ? 'foto' : 'fotos'})
                </h4>
                <p className="text-xs text-slate-500">
                  Fotos das oficinas, cursos, festivais e atividades que aparecem na Galeria da página individual.
                </p>
              </div>
            </div>

            {/* Add Photo to Gallery Form */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="block text-xs font-bold text-indigo-950">
                Adicionar Nova Foto à Galeria
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5">
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-xs font-bold text-slate-700 shadow-xs">
                    <UploadCloud className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{isProcessing ? 'Enviando...' : 'Upload de Foto'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isProcessing}
                      onChange={handleUploadGalleryPhoto}
                      className="hidden" 
                    />
                  </label>
                </div>
                
                <div className="sm:col-span-7 flex gap-2">
                  <input
                    type="url"
                    placeholder="Ou cole a URL da foto (https://...)"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    disabled={!newGalleryUrl.trim()}
                    className="px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Photos Grid */}
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {gallery.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Foto ${idx + 1}`} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Badge photo number */}
                    <div className="relative z-10 p-2 flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Action buttons bar */}
                    <div className="relative z-10 p-2 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex items-center justify-between gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setPreviewZoomImage(imgUrl)}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Ampliar Foto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Replace photo file input */}
                        <label 
                          className="p-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Alterar/Substituir Foto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleReplaceGalleryPhoto(idx, e)}
                            className="hidden" 
                          />
                        </label>

                        {/* Delete photo button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(idx)}
                          className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Excluir Foto da Galeria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Nenhuma foto adicionada à galeria deste projeto</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Utilize os botões acima para fazer o upload de fotos de atividades, oficinas e encontros.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Salvar Alterações de Imagens
          </button>
        </div>

      </div>

      {/* Lightbox / Zoom Preview */}
      {previewZoomImage && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewZoomImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewZoomImage} 
              alt="Ampliação da Imagem" 
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
