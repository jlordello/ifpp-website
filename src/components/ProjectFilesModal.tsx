import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Project, TransparencyRecord, RecordDocCategory } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { parseCurrencyBRL } from '../lib/currency';
import { processImageFile } from '../lib/imageUtils';
import { 
  X, UploadCloud, Image as ImageIcon, FileText, Calendar, DollarSign, 
  Trash2, CheckCircle2, AlertTriangle, Eye, Plus, 
  FolderOpen, Lock, Layers, Edit2, RefreshCw, Check
} from 'lucide-react';

interface ProjectFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  initialProjectId?: string;
  records: TransparencyRecord[];
  onAddRecord: (record: Omit<TransparencyRecord, 'id'>) => void;
  onUpdateRecord?: (record: TransparencyRecord) => void;
  onDeleteRecord?: (id: string) => void;
  isAdminLoggedIn: boolean;
  onLogin?: (username: string, password?: string) => boolean;
  onViewRecord?: (record: TransparencyRecord) => void;
}

export default function ProjectFilesModal({
  isOpen,
  onClose,
  projects,
  initialProjectId,
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  isAdminLoggedIn,
  onLogin,
  onViewRecord
}: ProjectFilesModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');
  
  // Upload form state
  const [fileTitle, setFileTitle] = useState('');
  const [fileDate, setFileDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fileDocCategory, setFileDocCategory] = useState<RecordDocCategory>('notas_fiscais');
  const [fileAmount, setFileAmount] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  
  // File data for new upload
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'photo' | 'document'>('photo');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  
  // Editing state for an existing record
  const [editingRecord, setEditingRecord] = useState<TransparencyRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDocCategory, setEditDocCategory] = useState<RecordDocCategory>('notas_fiscais');
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editFileType, setEditFileType] = useState<'photo' | 'document'>('photo');
  const [editPreviewThumbnail, setEditPreviewThumbnail] = useState<string | null>(null);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [editFileError, setEditFileError] = useState<string | null>(null);

  // Lightbox preview for full images
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Login form state (if not logged in)
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  // Sync initial project ID when modal opens or initialProjectId changes
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [initialProjectId, projects]);

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectRecords = records.filter(r => r.projectLinked === selectedProjectId);
  const photoRecords = projectRecords.filter(r => 
    r.fileType === 'photo' || 
    (r.fileUrl && (r.fileUrl.startsWith('data:image/') || r.fileUrl.includes('.jpg') || r.fileUrl.includes('.png') || r.fileUrl.includes('.jpeg') || r.fileUrl.includes('.webp')))
  );

  const handleFileSelection = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setIsProcessingFile(true);
    setFileName(file.name);

    if (!fileTitle.trim()) {
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setFileTitle(cleanName.replace(/[-_]+/g, ' '));
    }

    const isImage = file.type.startsWith('image/');
    setFileType(isImage ? 'photo' : 'document');

    if (file.name.toLowerCase().includes('nota') || file.name.toLowerCase().includes('recibo') || file.name.toLowerCase().includes('nf')) {
      setFileDocCategory('notas_fiscais');
    } else if (file.name.toLowerCase().includes('relatorio') || file.name.toLowerCase().includes('atividade')) {
      setFileDocCategory('relatorios');
    } else if (file.name.toLowerCase().includes('balanco') || file.name.toLowerCase().includes('prestacao')) {
      setFileDocCategory('prestacao_contas');
    } else if (file.name.toLowerCase().includes('termo') || file.name.toLowerCase().includes('convenio') || file.name.toLowerCase().includes('emenda')) {
      setFileDocCategory('termos_parceria');
    } else if (isImage) {
      setFileDocCategory('notas_fiscais');
    }

    try {
      if (isImage) {
        const dataUrl = await processImageFile(file);
        setFileUrl(dataUrl);
        setPreviewThumbnail(dataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFileUrl(reader.result as string);
          setPreviewThumbnail(null);
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setFileError(err.message || 'Erro ao processar arquivo.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Por favor, selecione um projeto.');
      return;
    }
    if (!fileTitle.trim()) {
      alert('Por favor, informe o título do arquivo ou foto.');
      return;
    }
    if (!fileUrl) {
      alert('Por favor, selecione um arquivo ou foto para upload.');
      return;
    }

    const parsedAmt = fileAmount ? parseCurrencyBRL(fileAmount) : undefined;

    const categoryLabels: Record<RecordDocCategory, string> = {
      notas_fiscais: 'Comprovante Fiscal / Nota Fiscal',
      prestacao_contas: 'Prestação de Contas / Demonstrativo',
      relatorios: 'Relatório de Atividades / Execução',
      termos_parceria: 'Termo de Parceria / Convênio / Fomento',
      outros: 'Documento / Registro'
    };

    const finalDescription = fileDescription.trim() || 
      `${categoryLabels[fileDocCategory]} vinculado ao projeto ${currentProject?.title || ''}.`;

    onAddRecord({
      type: 'conta',
      title: fileTitle.trim(),
      year: new Date(fileDate).getFullYear() || new Date().getFullYear(),
      date: fileDate.split('-').reverse().join('/'),
      description: finalDescription,
      fileUrl: fileUrl,
      fileName: fileName,
      fileType: fileType,
      docCategory: fileDocCategory,
      projectLinked: selectedProjectId,
      fundingSource: currentProject?.emendaId,
      amount: parsedAmt,
      category: 'despesa'
    });

    // Reset upload form
    setFileTitle('');
    setFileAmount('');
    setFileDescription('');
    setFileUrl('');
    setFileName('');
    setPreviewThumbnail(null);
    setFileError(null);
    
    // Switch to list view to show the newly added item
    setActiveTab('list');
  };

  // Start editing a record
  const handleStartEdit = (record: TransparencyRecord) => {
    setEditingRecord(record);
    setEditTitle(record.title);
    setEditDate(record.date.includes('/') ? record.date.split('/').reverse().join('-') : record.date);
    setEditDocCategory(record.docCategory || 'notas_fiscais');
    setEditAmount(record.amount !== undefined ? record.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditDescription(record.description || '');
    setEditFileUrl(record.fileUrl || '');
    setEditFileName(record.fileName || '');
    setEditFileType(record.fileType || 'photo');
    setEditPreviewThumbnail(record.fileUrl && (record.fileUrl.startsWith('data:image/') || record.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) ? record.fileUrl : null);
    setEditFileError(null);
  };

  // Handle file change when editing record
  const handleEditFileSelection = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditFileError(null);
    setIsProcessingEdit(true);
    setEditFileName(file.name);

    const isImage = file.type.startsWith('image/');
    setEditFileType(isImage ? 'photo' : 'document');

    try {
      if (isImage) {
        const dataUrl = await processImageFile(file);
        setEditFileUrl(dataUrl);
        setEditPreviewThumbnail(dataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setEditFileUrl(reader.result as string);
          setEditPreviewThumbnail(null);
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setEditFileError(err.message || 'Erro ao processar nova imagem/arquivo.');
    } finally {
      setIsProcessingEdit(false);
    }
  };

  // Save edited record
  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateRecord) return;
    if (!editTitle.trim()) {
      alert('Informe o título do registro.');
      return;
    }

    const parsedAmt = editAmount ? parseCurrencyBRL(editAmount) : undefined;
    const isImg = editFileUrl ? (editFileUrl.startsWith('data:image/') || editFileUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) !== null) : (editingRecord.fileType === 'photo');

    const updated: TransparencyRecord = {
      ...editingRecord,
      title: editTitle.trim(),
      date: editDate.includes('-') ? editDate.split('-').reverse().join('/') : editDate,
      docCategory: editDocCategory,
      amount: parsedAmt,
      description: editDescription.trim(),
      fileUrl: editFileUrl || editingRecord.fileUrl || '#',
      fileName: editFileName || editingRecord.fileName,
      fileType: isImg ? 'photo' : 'document',
      projectLinked: selectedProjectId
    };

    onUpdateRecord(updated);
    setEditingRecord(null);
  };

  const handleQuickLogin = (e: FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      const ok = onLogin(loginUser, loginPass);
      if (ok) {
        setLoginFailed(false);
        setLoginUser('');
        setLoginPass('');
      } else {
        setLoginFailed(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Anexar Fotos e Documentos Comprobatórios
              </h3>
              <p className="text-xs text-slate-300">
                Os arquivos e imagens cadastrados aqui aparecerão em "Documentos e comprovantes vinculados"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Selector & Tab Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Projeto Alvo:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.year}) • {p.type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center rounded-lg bg-slate-200/80 p-0.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setEditingRecord(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload' && !editingRecord
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Cadastrar Arquivo/Foto
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                setEditingRecord(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'list' || editingRecord
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Ver Anexados ({projectRecords.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* NON-LOGGED IN WARNING */}
          {!isAdminLoggedIn && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-amber-900">Autenticação Necessária para Cadastrar Documentos</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Para vincular documentos comprobatórios e fotos oficiais a este projeto, faça o login administrativo.
                  </p>

                  <form onSubmit={handleQuickLogin} className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Usuário"
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-36"
                    />
                    <input
                      type="password"
                      placeholder="Senha"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-32"
                    />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 font-bold text-white transition-colors cursor-pointer"
                    >
                      Autenticar
                    </button>
                    {loginFailed && (
                      <span className="text-[11px] text-rose-600 font-semibold">Credenciais incorretas.</span>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* EDIT RECORD INLINE FORM */}
          {editingRecord ? (
            <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <Edit2 className="w-4 h-4 text-indigo-600" />
                  Editar / Atualizar Imagem e Informações do Registro
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                {/* Image Update / Preview Section */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                  <span className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    Atualizar Imagem ou Arquivo do Comprovante
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      {editPreviewThumbnail ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                          <img src={editPreviewThumbnail} alt="Prévia" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setZoomImage(editPreviewThumbnail)}
                            className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                          <FileText className="w-6 h-6 mb-1 text-slate-500" />
                          <span className="text-[10px] text-slate-600 truncate max-w-full font-medium">
                            {editFileName || 'Arquivo existente'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-8 space-y-2">
                      <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer font-bold text-indigo-900 transition-colors">
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span>{isProcessingEdit ? 'Processando...' : 'Substituir Imagem/Arquivo (Upload)'}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf,.docx,.xlsx,.txt"
                          onChange={handleEditFileSelection}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400">
                        Selecione uma nova imagem (foto, recibo, nota fiscal) do seu computador ou celular.
                      </p>
                      {editFileError && (
                        <p className="text-[10px] text-rose-600 font-bold">{editFileError}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Título do Documento/Comprovante *</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Categoria (Aparecerá em Documentos Vinculados)</label>
                    <select
                      value={editDocCategory}
                      onChange={(e) => setEditDocCategory(e.target.value as RecordDocCategory)}
                      className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                    >
                      <option value="notas_fiscais">🧾 Notas fiscais e comprovantes</option>
                      <option value="prestacao_contas">📊 Prestação de contas</option>
                      <option value="relatorios">📄 Relatórios de atividades</option>
                      <option value="termos_parceria">📑 Termos / Parcerias</option>
                      <option value="outros">📷 Outros documentos / Fotos</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Data</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Valor Auditado / Comprovado (BRL)</label>
                    <CurrencyInput
                      value={editAmount}
                      onChange={setEditAmount}
                      placeholder="R$ 0,00"
                      className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Descrição / Finalidade</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'upload' ? (
            /* UPLOAD TAB */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Dropzone File Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Selecionar Foto ou Arquivo do Projeto *
                </label>
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-xl p-4 sm:p-6 transition-all text-center relative">
                  <input
                    type="file"
                    accept="image/*,.pdf,.docx,.xlsx,.txt"
                    onChange={handleFileSelection}
                    disabled={!isAdminLoggedIn}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  
                  {previewThumbnail ? (
                    <div className="flex flex-col items-center">
                      <div className="relative group">
                        <img 
                          src={previewThumbnail} 
                          alt="Prévia da foto" 
                          className="w-32 h-24 sm:w-44 sm:h-32 object-cover rounded-lg shadow-md border border-indigo-200"
                        />
                        <span className="absolute bottom-1 right-1 bg-indigo-950/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Imagem Selecionada
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-900 mt-2 truncate max-w-xs">{fileName}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Imagem otimizada com sucesso</span>
                      <span className="text-[10px] text-slate-400 mt-1">Clique para trocar a foto</span>
                    </div>
                  ) : fileName ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-indigo-950 truncate max-w-xs">{fileName}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Documento selecionado com sucesso</span>
                      <span className="text-[10px] text-indigo-600 font-semibold mt-1">Clique para trocar de arquivo</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-indigo-950 block">
                          Clique aqui para selecionar uma Foto ou Arquivo
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Aceita fotos (JPG, PNG, WEBP) e documentos (PDF, DOCX, Planilhas)
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-100/60 px-2.5 py-1 rounded-full">
                        Compactação automática e segura de imagens integrada
                      </span>
                    </div>
                  )}

                  {isProcessingFile && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-indigo-700 animate-pulse">
                        Processando e otimizando arquivo...
                      </span>
                    </div>
                  )}
                </div>

                {fileError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {fileError}
                  </p>
                )}
              </div>

              {/* Title & Purpose Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título / Identificação do Arquivo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nota Fiscal 1042 - Equipamentos de Fotografia"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria em "Documentos e Comprovantes Vinculados"
                  </label>
                  <select
                    value={fileDocCategory}
                    onChange={(e) => setFileDocCategory(e.target.value as RecordDocCategory)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="notas_fiscais">🧾 Notas fiscais e comprovantes</option>
                    <option value="prestacao_contas">📊 Prestação de contas</option>
                    <option value="relatorios">📄 Relatórios de atividades</option>
                    <option value="termos_parceria">📑 Termos / Parcerias</option>
                    <option value="outros">📷 Outros documentos / Fotos da ação</option>
                  </select>
                </div>
              </div>

              {/* Date & Optional Amount Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Data do Registro *
                  </label>
                  <input
                    type="date"
                    required
                    value={fileDate}
                    onChange={(e) => setFileDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Valor Comprovado (Opcional - se houver nota fiscal/recibo)
                  </label>
                  <CurrencyInput
                    value={fileAmount}
                    onChange={setFileAmount}
                    placeholder="R$ 0,00"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Description / Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição / Finalidade do Comprovante (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Informações adicionais sobre esta foto ou comprovante para o público e órgãos de controle..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isAdminLoggedIn || !fileUrl || isProcessingFile}
                  className="px-5 py-2.5 rounded-lg bg-indigo-900 hover:bg-indigo-950 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Cadastrar e Vincular ao Projeto
                </button>
              </div>

            </form>
          ) : (
            /* LIST TAB */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Arquivos e Fotos Vinculados a "{currentProject?.title}"
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estes itens aparecem para os visitantes em "Documentos e comprovantes vinculados".
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Arquivo/Foto
                </button>
              </div>

              {projectRecords.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700 mt-3">Nenhum arquivo ou foto vinculado a este projeto ainda</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Utilize a aba "Cadastrar Arquivo/Foto" para enviar fotos de oficinas, relatórios ou notas fiscais.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-3.5 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:bg-indigo-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Primeiro Arquivo
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {projectRecords.map((item) => {
                    const isImg = item.fileType === 'photo' || (item.fileUrl && (item.fileUrl.startsWith('data:image/') || item.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) !== null));
                    return (
                      <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {isImg && item.fileUrl && item.fileUrl !== '#' ? (
                            <div 
                              onClick={() => setZoomImage(item.fileUrl || null)}
                              className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:opacity-90 relative group"
                              title="Clique para ampliar"
                            >
                              <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
                              <FileText className="w-5 h-5 text-indigo-700" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-100">
                                {item.docCategory || 'Comprovante'}
                              </span>
                              {isImg && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 text-emerald-600" />
                                  Foto/Imagem
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{item.date}</span>
                              {item.amount !== undefined && item.amount > 0 && (
                                <span className="text-[10px] font-mono font-bold text-emerald-700">
                                  {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              )}
                            </div>
                            <span className="block text-xs font-bold text-slate-900 truncate mt-1">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="block text-[11px] text-slate-500 truncate mt-0.5 max-w-xl">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {isImg && item.fileUrl && item.fileUrl !== '#' ? (
                            <button
                              type="button"
                              onClick={() => setZoomImage(item.fileUrl || null)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Visualizar Imagem"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver
                            </button>
                          ) : onViewRecord ? (
                            <button
                              type="button"
                              onClick={() => onViewRecord(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver
                            </button>
                          ) : null}

                          {isAdminLoggedIn && onUpdateRecord && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Atualizar Imagem ou Informações"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-700" />
                              Editar / Trocar Imagem
                            </button>
                          )}

                          {isAdminLoggedIn && onDeleteRecord && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir "${item.title}"?`)) {
                                  onDeleteRecord(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Zoom / Lightbox Preview */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={zoomImage} 
              alt="Ampliação da foto ou comprovante" 
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
