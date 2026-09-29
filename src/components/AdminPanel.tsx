import { useState, FormEvent, ChangeEvent } from 'react';
import { TransparencyRecord, Project, Emenda, RecordType, ProjectType, AdminUser, RecordDocCategory } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { parseCurrencyBRL } from '../lib/currency';
import { processImageFile } from '../lib/imageUtils';
import ProjectFilesModal from './ProjectFilesModal';
import ProjectImagesModal from './ProjectImagesModal';
import { 
  Settings, Key, Plus, Trash2, Link as LinkIcon, FileCheck, Landmark, 
  Calendar, Layers, Sparkles, CheckCircle2, RefreshCw, Info, DollarSign, ListCollapse,
  Edit, X, AlertTriangle, FileText, UploadCloud, User, Shield, Lock, Paperclip, Copy, MessageSquare,
  Image as ImageIcon, Eye
} from 'lucide-react';

interface AdminPanelProps {
  isAdminLoggedIn: boolean;
  onLogin: (username: string, password?: string) => boolean;
  onLogout: () => void;
  
  records: TransparencyRecord[];
  addRecord: (record: Omit<TransparencyRecord, 'id'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (record: TransparencyRecord) => void;

  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  updateProject: (project: Project) => void;

  emendas: Emenda[];
  addEmenda: (emenda: Omit<Emenda, 'id'>) => void;
  deleteEmenda: (id: string) => void;
  updateEmenda: (emenda: Emenda) => void;

  loggedInUser: AdminUser | null;
  users: AdminUser[];
  onAddUser: (user: AdminUser) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onUpdateUser: (user: AdminUser) => Promise<void>;
}

export default function AdminPanel({
  isAdminLoggedIn,
  onLogin,
  onLogout,
  records,
  addRecord,
  deleteRecord,
  updateRecord,
  projects,
  addProject,
  deleteProject,
  updateProject,
  emendas,
  addEmenda,
  deleteEmenda,
  updateEmenda,
  loggedInUser,
  users,
  onAddUser,
  onDeleteUser,
  onUpdateUser
}: AdminPanelProps) {
  
  // Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Active Section Inside Admin Panel
  const [adminSection, setAdminSection] = useState<'contas' | 'atas' | 'projetos' | 'emendas' | 'usuarios' | 'perfil'>('contas');

  // Modal to manage / attach files & photos to a specific project
  const [projectToManageFiles, setProjectToManageFiles] = useState<Project | null>(null);

  // User Management State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showResetAdminModal, setShowResetAdminModal] = useState(false);
  const [confirmResetText, setConfirmResetText] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showProfileNewPassword, setShowProfileNewPassword] = useState(false);
  const [showConfirmProfilePassword, setShowConfirmProfilePassword] = useState(false);

  // Newly created or password-reset credentials modal
  const [credentialsToCopy, setCredentialsToCopy] = useState<{
    name: string;
    username: string;
    password: string;
    actionType: 'creation' | 'reset' | 'profile-change';
  } | null>(null);

  // Password reset confirmation modal state
  const [userToResetPassword, setUserToResetPassword] = useState<AdminUser | null>(null);
  const [tempResetPassword, setTempResetPassword] = useState('');

  const generateRandomPassword = () => {
    // Generates a simple, secure 8-character password that is easy to read
    const letters = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const specials = '@#$%&*';
    
    let pass = '';
    // ensure at least 1 uppercase, 1 lowercase, 1 number, 1 special
    pass += letters.charAt(Math.floor(Math.random() * 24)); // lowercase approximate
    pass += letters.charAt(Math.floor(Math.random() * 25) + 24); // uppercase approximate
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += specials.charAt(Math.floor(Math.random() * specials.length));
    
    // Fill the rest up to 8 chars
    const allAllowed = letters + numbers + specials;
    for (let i = 0; i < 4; i++) {
      pass += allAllowed.charAt(Math.floor(Math.random() * allAllowed.length));
    }
    
    // Shuffle the characters
    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  };

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newProfilePassword, setNewProfilePassword] = useState('');
  const [confirmProfilePassword, setConfirmProfilePassword] = useState('');


  // Success Feedbacks
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- FORM STATES ---
  
  // New States for File URLs
  const [contaFileUrl, setContaFileUrl] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');

  // Editing state
  const [editingRecord, setEditingRecord] = useState<TransparencyRecord | null>(null);

  // Editing Modal form states
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<RecordType>('conta');
  const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editCategory, setEditCategory] = useState<'receita' | 'despesa'>('despesa');
  const [editDocCategory, setEditDocCategory] = useState<RecordDocCategory | undefined>(undefined);
  const [editProjectLinked, setEditProjectLinked] = useState('');
  const [editFundingSource, setEditFundingSource] = useState('');

  // Editing Emenda (Demanda) modal form states
  const [editingEmenda, setEditingEmenda] = useState<Emenda | null>(null);
  const [editEmendaCode, setEditEmendaCode] = useState('');
  const [editEmendaAuthor, setEditEmendaAuthor] = useState('');
  const [editEmendaAmount, setEditEmendaAmount] = useState<string>('');
  const [editEmendaYear, setEditEmendaYear] = useState<number>(new Date().getFullYear());
  const [editEmendaDescription, setEditEmendaDescription] = useState('');
  const [editEmendaProjectLinked, setEditEmendaProjectLinked] = useState('');

  // Editing Project (Iniciativa/Curso) modal form states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjTitle, setEditProjTitle] = useState('');
  const [editProjType, setEditProjType] = useState<ProjectType>('projeto');
  const [editProjCategory, setEditProjCategory] = useState('');
  const [editProjYear, setEditProjYear] = useState<number>(new Date().getFullYear());
  const [editProjDesc, setEditProjDesc] = useState('');
  const [editProjFullDesc, setEditProjFullDesc] = useState('');
  const [editProjStatus, setEditProjStatus] = useState<Project['status']>('em_andamento');
  const [editProjImpact, setEditProjImpact] = useState('');
  const [editProjLocation, setEditProjLocation] = useState('');
  const [editProjTags, setEditProjTags] = useState('');
  const [editProjTerritories, setEditProjTerritories] = useState('');
  const [editProjIndicatorsStr, setEditProjIndicatorsStr] = useState('');
  const [editProjMainImage, setEditProjMainImage] = useState('');
  const [editProjGallery, setEditProjGallery] = useState<string[]>([]);
  const [newEditGalleryUrl, setNewEditGalleryUrl] = useState('');
  const [editProjBudget, setEditProjBudget] = useState<string>('');
  const [editProjEmendaId, setEditProjEmendaId] = useState('');
  const [editProjFundingSourceType, setEditProjFundingSourceType] = useState('');
  const [editProjFundingInstrument, setEditProjFundingInstrument] = useState('');
  const [editProjFundingOrgan, setEditProjFundingOrgan] = useState('');
  const [editProjFundingAuthor, setEditProjFundingAuthor] = useState('');
  const [editProjReceivedAmount, setEditProjReceivedAmount] = useState<string>('');
  const [editProjProvenExpenses, setEditProjProvenExpenses] = useState<string>('');

  // Extended Transferegov and execution states
  const [editProjProposalNumber, setEditProjProposalNumber] = useState('');
  const [editProjProponentName, setEditProjProponentName] = useState('');
  const [editProjProponentCnpj, setEditProjProponentCnpj] = useState('');
  const [editProjGrantingOrgan, setEditProjGrantingOrgan] = useState('');
  const [editProjProgramName, setEditProjProgramName] = useState('');
  const [editProjOfficialObject, setEditProjOfficialObject] = useState('');
  const [editProjGlobalValue, setEditProjGlobalValue] = useState<string>('');
  const [editProjTransferValue, setEditProjTransferValue] = useState<string>('');
  const [editProjCounterpartValue, setEditProjCounterpartValue] = useState<string>('');
  const [editProjEmendaNumber, setEditProjEmendaNumber] = useState('');
  const [editProjAuthorIndication, setEditProjAuthorIndication] = useState('');
  const [editProjProcessNumber, setEditProjProcessNumber] = useState('');
  const [editProjInstrumentNumber, setEditProjInstrumentNumber] = useState('');
  const [editProjGoalsAndObjectives, setEditProjGoalsAndObjectives] = useState('');
  const [editProjTargetAudience, setEditProjTargetAudience] = useState('');
  const [editProjParticipantsCount, setEditProjParticipantsCount] = useState('');
  const [editProjExecutionLocations, setEditProjExecutionLocations] = useState('');

  // Dedicated Project Images Manager modal
  const [projectToManageImages, setProjectToManageImages] = useState<Project | null>(null);

  // Custom confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
    type: 'record' | 'project' | 'emenda' | 'user';
    onConfirm: () => void;
  } | null>(null);
  
  // Form Conta
  const [contaTitle, setContaTitle] = useState('');
  const [contaType, setContaType] = useState<RecordType>('conta');
  const [contaYear, setContaYear] = useState(new Date().getFullYear());
  const [contaAmount, setContaAmount] = useState<string>('');
  const [contaCategory, setContaCategory] = useState<'receita' | 'despesa'>('despesa');
  const [contaDate, setContaDate] = useState('');
  const [contaDescription, setContaDescription] = useState('');
  const [contaProjectLinked, setContaProjectLinked] = useState('');
  const [contaFundingSource, setContaFundingSource] = useState('');

  // Form ATA / Estatuto
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<RecordType>('ata');
  const [docYear, setDocYear] = useState(new Date().getFullYear());
  const [docDate, setDocDate] = useState('');
  const [docDescription, setDocDescription] = useState('');

  // Form Emenda
  const [emendaCode, setEmendaCode] = useState('');
  const [emendaAuthor, setEmendaAuthor] = useState('');
  const [emendaAmount, setEmendaAmount] = useState<string>('');
  const [emendaYear, setEmendaYear] = useState(new Date().getFullYear());
  const [emendaDescription, setEmendaDescription] = useState('');
  const [emendaProjectLinked, setEmendaProjectLinked] = useState('');

  // Form Projeto/Curso/Evento
  const [projTitle, setProjTitle] = useState('');
  const [projType, setProjType] = useState<ProjectType>('projeto');
  const [projCategory, setProjCategory] = useState('Formação / Juventude');
  const [projYear, setProjYear] = useState(new Date().getFullYear());
  const [projDescription, setProjDescription] = useState('');
  const [projFullDescription, setProjFullDescription] = useState('');
  const [projStatus, setProjStatus] = useState<Project['status']>('em_andamento');
  const [projImpact, setProjImpact] = useState('');
  const [projLocation, setProjLocation] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projTerritories, setProjTerritories] = useState('');
  const [projIndicatorsStr, setProjIndicatorsStr] = useState('');
  const [projMainImage, setProjMainImage] = useState('');
  const [projBudget, setProjBudget] = useState<string>('');
  const [projEmendaId, setProjEmendaId] = useState('');
  const [projFundingSourceType, setProjFundingSourceType] = useState('Emenda Parlamentar');
  const [projFundingInstrument, setProjFundingInstrument] = useState('');
  const [projFundingOrgan, setProjFundingOrgan] = useState('');
  const [projFundingAuthor, setProjFundingAuthor] = useState('');
  const [projReceivedAmount, setProjReceivedAmount] = useState<string>('');
  const [projProvenExpenses, setProjProvenExpenses] = useState<string>('');

  // File states (errors and loaded file names)
  const [contaFileError, setContaFileError] = useState<string | null>(null);
  const [docFileError, setDocFileError] = useState<string | null>(null);
  const [editFileError, setEditFileError] = useState<string | null>(null);

  const [contaFileName, setContaFileName] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState<string | null>(null);

  // Handles
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'conta' | 'doc' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');

    // Check size limit: Firestore has a physical limit of 1,048,576 bytes (1MB) per document.
    // We now compress documents automatically client-side using GZIP compression.
    // This allows files up to 5MB to be uploaded directly since they compress heavily.
    if (!isImage && file.size > 5 * 1024 * 1024) {
      const errMsg = `O arquivo "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) é muito grande. O limite máximo para upload direto com compressão automática é de 5MB.\n\nPara arquivos maiores, por favor salve o arquivo no Google Drive ou Dropbox e cole o link correspondente no campo "Link Externo".`;
      if (type === 'conta') {
        setContaFileError(errMsg);
        setContaFileUrl('');
        setContaFileName(null);
      } else if (type === 'doc') {
        setDocFileError(errMsg);
        setDocFileUrl('');
        setDocFileName(null);
      } else if (type === 'edit') {
        setEditFileError(errMsg);
        setEditFileUrl('');
        setEditFileName(null);
      }
      alert(errMsg);
      return;
    }

    // Set initial file info and clear old errors
    if (type === 'conta') {
      setContaFileError(null);
      setContaFileName(file.name);
    } else if (type === 'doc') {
      setDocFileError(null);
      setDocFileName(file.name);
    } else if (type === 'edit') {
      setEditFileError(null);
      setEditFileName(file.name);
    }

    showNotification(`Processando arquivo "${file.name}"...`);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimension to keep file size reasonable
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress with progressive quality reduction to be under 600KB
            let quality = 0.75;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);

            while (dataUrl.length > 600 * 1024 && quality > 0.15) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            if (type === 'conta') {
              setContaFileUrl(dataUrl);
            } else if (type === 'doc') {
              setDocFileUrl(dataUrl);
            } else if (type === 'edit') {
              setEditFileUrl(dataUrl);
            }
            showNotification(`Imagem "${file.name}" comprimida e carregada com sucesso!`);
          } else {
            const rawBase64 = event.target?.result as string;
            if (rawBase64.length > 6.5 * 1024 * 1024) {
              const errMsg = `A imagem "${file.name}" é muito grande (excede o limite de 5MB). Por favor, reduza o tamanho ou selecione uma imagem menor.`;
              if (type === 'conta') {
                setContaFileError(errMsg);
                setContaFileUrl('');
                setContaFileName(null);
              } else if (type === 'doc') {
                setDocFileError(errMsg);
                setDocFileUrl('');
                setDocFileName(null);
              } else if (type === 'edit') {
                setEditFileError(errMsg);
                setEditFileUrl('');
                setEditFileName(null);
              }
              alert(errMsg);
              return;
            }
            if (type === 'conta') setContaFileUrl(rawBase64);
            else if (type === 'doc') setDocFileUrl(rawBase64);
            else if (type === 'edit') setEditFileUrl(rawBase64);
            showNotification(`Imagem "${file.name}" carregada com sucesso!`);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      showNotification(`Processando documento "${file.name}"...`);
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (base64.length > 6.5 * 1024 * 1024) {
          const errMsg = `O arquivo "${file.name}" é muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). O limite para upload direto é de 5MB. Por favor, utilize um link externo do Google Drive para este arquivo.`;
          if (type === 'conta') {
            setContaFileError(errMsg);
            setContaFileUrl('');
            setContaFileName(null);
          } else if (type === 'doc') {
            setDocFileError(errMsg);
            setDocFileUrl('');
            setDocFileName(null);
          } else if (type === 'edit') {
            setEditFileError(errMsg);
            setEditFileUrl('');
            setEditFileName(null);
          }
          alert(errMsg);
          return;
        }
        if (type === 'conta') setContaFileUrl(base64);
        else if (type === 'doc') setDocFileUrl(base64);
        else if (type === 'edit') setEditFileUrl(base64);
        showNotification(`Arquivo "${file.name}" carregado com sucesso!`);
      };
      reader.onerror = () => {
        console.error("Erro na leitura do arquivo:", reader.error);
        alert("Não foi possível carregar o arquivo.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEdit = (record: TransparencyRecord) => {
    setEditingRecord(record);
    setEditTitle(record.title);
    setEditType(record.type);
    setEditYear(record.year);
    
    // Convert DD/MM/YYYY to YYYY-MM-DD for standard html inputs
    const parts = record.date.split('/');
    const dateVal = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
    setEditDate(dateVal);
    
    setEditDescription(record.description || '');
    setEditFileUrl(record.fileUrl && record.fileUrl !== '#' ? record.fileUrl : '');
    setEditAmount(record.amount !== undefined ? record.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditCategory(record.category || 'despesa');
    setEditDocCategory(record.docCategory || 'notas_fiscais');
    setEditProjectLinked(record.projectLinked || '');
    setEditFundingSource(record.fundingSource || '');
    setEditFileError(null);
    setEditFileName(record.fileUrl && record.fileUrl !== '#' ? 'Documento anexo existente' : null);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!editTitle || !editDate) {
      showNotification('Por favor, preencha o título e a data.');
      return;
    }

    const isImg = editFileUrl ? (editFileUrl.startsWith('data:image/') || editFileUrl.includes('.jpg') || editFileUrl.includes('.png')) : (editingRecord.fileType === 'photo');
    const updated: TransparencyRecord = {
      ...editingRecord,
      title: editTitle,
      type: editType,
      year: Number(editYear),
      date: editDate.includes('-') ? editDate.split('-').reverse().join('/') : editDate,
      description: editDescription,
      fileUrl: editFileUrl || '#',
      fileName: editFileName || editingRecord.fileName,
      fileType: isImg ? 'photo' : 'document',
      docCategory: editDocCategory || editingRecord.docCategory,
      amount: editType === 'conta' && editAmount ? parseCurrencyBRL(editAmount) : undefined,
      category: editType === 'conta' ? editCategory : undefined,
      projectLinked: editProjectLinked || undefined,
      fundingSource: editType === 'conta' ? (editFundingSource || undefined) : undefined,
    };

    updateRecord(updated);
    setEditingRecord(null);
    setEditFileError(null);
    setEditFileName(null);
    showNotification('Documento atualizado com sucesso!');
  };

  const handleStartEditEmenda = (emenda: Emenda) => {
    setEditingEmenda(emenda);
    setEditEmendaCode(emenda.code);
    setEditEmendaAuthor(emenda.author);
    setEditEmendaAmount(emenda.amount !== undefined ? emenda.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditEmendaYear(emenda.year);
    setEditEmendaDescription(emenda.description || '');
    setEditEmendaProjectLinked(emenda.allocatedProjectId || '');
  };

  const handleSaveEditEmenda = (e: FormEvent) => {
    e.preventDefault();
    if (!editingEmenda) return;
    if (!editEmendaCode.trim() || !editEmendaAuthor.trim() || !editEmendaAmount) {
      showNotification('Por favor, preencha o código, o autor e o valor do aporte.');
      return;
    }

    const parsedVal = parseCurrencyBRL(editEmendaAmount);
    if (parsedVal <= 0) {
      showNotification('Por favor, informe um valor de repasse válido.');
      return;
    }

    const updated: Emenda = {
      ...editingEmenda,
      code: editEmendaCode.trim(),
      author: editEmendaAuthor.trim(),
      amount: parsedVal,
      year: Number(editEmendaYear),
      description: editEmendaDescription.trim(),
      allocatedProjectId: editEmendaProjectLinked || undefined
    };

    updateEmenda(updated);
    setEditingEmenda(null);
    showNotification('Demanda / Emenda parlamentar atualizada com sucesso!');
  };

  const handleStartEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjTitle(project.title);
    setEditProjType(project.type);
    setEditProjCategory(project.category || '');
    setEditProjYear(project.year || new Date().getFullYear());
    setEditProjDesc(project.description || '');
    setEditProjFullDesc(project.fullDescription || '');
    setEditProjStatus(project.status);
    setEditProjImpact(project.impact || '');
    setEditProjLocation(project.location || '');
    setEditProjTags(project.tags ? project.tags.join(', ') : '');
    setEditProjTerritories(project.territories ? project.territories.join(', ') : '');
    setEditProjIndicatorsStr(project.indicators ? project.indicators.map(i => `${i.value} | ${i.label}`).join('\n') : '');
    setEditProjMainImage(project.mainImage || '');
    setEditProjGallery(project.gallery ? [...project.gallery] : []);
    setNewEditGalleryUrl('');
    setEditProjBudget(project.budget !== undefined ? project.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditProjEmendaId(project.emendaId || '');
    setEditProjFundingSourceType(project.fundingSourceType || '');
    setEditProjFundingInstrument(project.fundingInstrument || '');
    setEditProjFundingOrgan(project.fundingOrgan || '');
    setEditProjFundingAuthor(project.fundingAuthor || '');
    setEditProjReceivedAmount(project.receivedAmount !== undefined ? project.receivedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditProjProvenExpenses(project.provenExpenses !== undefined ? project.provenExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');

    // Transferegov and execution metadata
    setEditProjProposalNumber(project.proposalNumber || '');
    setEditProjProponentName(project.proponentName || '');
    setEditProjProponentCnpj(project.proponentCnpj || '');
    setEditProjGrantingOrgan(project.grantingOrgan || '');
    setEditProjProgramName(project.programName || '');
    setEditProjOfficialObject(project.officialObject || '');
    setEditProjGlobalValue(project.globalValue !== undefined ? project.globalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditProjTransferValue(project.transferValue !== undefined ? project.transferValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditProjCounterpartValue(project.counterpartValue !== undefined ? project.counterpartValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
    setEditProjEmendaNumber(project.emendaNumber || '');
    setEditProjAuthorIndication(project.authorIndication || '');
    setEditProjProcessNumber(project.processNumber || '');
    setEditProjInstrumentNumber(project.instrumentNumber || '');
    setEditProjGoalsAndObjectives(project.goalsAndObjectives || '');
    setEditProjTargetAudience(project.targetAudience || '');
    setEditProjParticipantsCount(project.participantsCount || '');
    setEditProjExecutionLocations(project.executionLocations || '');
  };

  const handleSaveEditProject = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editProjTitle.trim()) {
      showNotification('Por favor, informe o título da iniciativa ou curso.');
      return;
    }

    const parsedIndicators = editProjIndicatorsStr
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|');
        return {
          value: parts[0]?.trim() || '',
          label: parts[1]?.trim() || ''
        };
      })
      .filter(ind => ind.value && ind.label);

    const parsedTags = editProjTags.split(',').map(t => t.trim()).filter(Boolean);
    const parsedTerritories = editProjTerritories.split(',').map(t => t.trim()).filter(Boolean);

    const updated: Project = {
      ...editingProject,
      title: editProjTitle.trim(),
      type: editProjType,
      category: editProjCategory.trim() || undefined,
      year: Number(editProjYear),
      description: editProjDesc.trim(),
      fullDescription: editProjFullDesc.trim() || undefined,
      status: editProjStatus,
      impact: editProjImpact.trim() || undefined,
      location: editProjLocation.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      territories: parsedTerritories.length > 0 ? parsedTerritories : undefined,
      indicators: parsedIndicators.length > 0 ? parsedIndicators : undefined,
      mainImage: editProjMainImage.trim() || undefined,
      gallery: editProjGallery.length > 0 ? editProjGallery : undefined,
      budget: editProjBudget ? parseCurrencyBRL(editProjBudget) : undefined,
      emendaId: editProjEmendaId || undefined,
      fundingSourceType: editProjFundingSourceType.trim() || undefined,
      fundingInstrument: editProjFundingInstrument.trim() || undefined,
      fundingOrgan: editProjFundingOrgan.trim() || undefined,
      fundingAuthor: editProjFundingAuthor.trim() || undefined,
      receivedAmount: editProjReceivedAmount ? parseCurrencyBRL(editProjReceivedAmount) : undefined,
      provenExpenses: editProjProvenExpenses ? parseCurrencyBRL(editProjProvenExpenses) : undefined,

      proposalNumber: editProjProposalNumber.trim() || undefined,
      proponentName: editProjProponentName.trim() || undefined,
      proponentCnpj: editProjProponentCnpj.trim() || undefined,
      grantingOrgan: editProjGrantingOrgan.trim() || undefined,
      programName: editProjProgramName.trim() || undefined,
      officialObject: editProjOfficialObject.trim() || undefined,
      globalValue: editProjGlobalValue ? parseCurrencyBRL(editProjGlobalValue) : undefined,
      transferValue: editProjTransferValue ? parseCurrencyBRL(editProjTransferValue) : undefined,
      counterpartValue: editProjCounterpartValue ? parseCurrencyBRL(editProjCounterpartValue) : undefined,
      emendaNumber: editProjEmendaNumber.trim() || undefined,
      authorIndication: editProjAuthorIndication.trim() || undefined,
      processNumber: editProjProcessNumber.trim() || undefined,
      instrumentNumber: editProjInstrumentNumber.trim() || undefined,
      goalsAndObjectives: editProjGoalsAndObjectives.trim() || undefined,
      targetAudience: editProjTargetAudience.trim() || undefined,
      participantsCount: editProjParticipantsCount.trim() || undefined,
      executionLocations: editProjExecutionLocations.trim() || undefined
    };

    updateProject(updated);
    setEditingProject(null);
    showNotification('Iniciativa/Projeto atualizado com sucesso!');
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      showNotification('O usuário de login é obrigatório.');
      return;
    }
    const success = onLogin(usernameInput, passwordInput);
    if (success) {
      setLoginError(false);
      setPasswordInput('');
      setUsernameInput('');
    } else {
      setLoginError(true);
    }
  };

  const handleRestoreAdminPassword = async () => {
    const adminUser = users.find(u => u.username === 'admin') || {
      id: 'user-admin',
      username: 'admin',
      name: 'Administrador Principal',
      password: '241910',
      role: 'admin'
    };

    await onUpdateUser({
      ...adminUser,
      password: '241910'
    });

    showNotification('A senha do usuário admin foi redefinida com sucesso para "241910"!');
    setShowResetAdminModal(false);
    setConfirmResetText('');
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      showNotification('Todos os campos de usuário são obrigatórios.');
      return;
    }
    // Check if user already exists
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      showNotification('Este nome de usuário já está cadastrado.');
      return;
    }

    const userPayload = {
      id: newUsername.trim().toLowerCase(),
      username: newUsername.trim().toLowerCase(),
      password: newPassword,
      name: newName.trim(),
      role: newRole
    };

    await onAddUser(userPayload);

    // Save credentials to open copying tab/modal
    setCredentialsToCopy({
      name: userPayload.name,
      username: userPayload.username,
      password: userPayload.password,
      actionType: 'creation'
    });

    setNewUsername('');
    setNewName('');
    setNewRole('editor');
    setNewPassword(generateRandomPassword());
    showNotification('Novo usuário cadastrado com sucesso!');
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!loggedInUser) return;
    if (currentPassword !== loggedInUser.password) {
      showNotification('A senha atual inserida está incorreta.');
      return;
    }
    if (newProfilePassword !== confirmProfilePassword) {
      showNotification('A nova senha e a confirmação não conferem.');
      return;
    }
    if (newProfilePassword.length < 4) {
      showNotification('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    await onUpdateUser({
      ...loggedInUser,
      password: newProfilePassword
    });

    setCredentialsToCopy({
      name: loggedInUser.name,
      username: loggedInUser.username,
      password: newProfilePassword,
      actionType: 'profile-change'
    });

    setCurrentPassword('');
    setNewProfilePassword('');
    setConfirmProfilePassword('');
    showNotification('Sua senha foi alterada com sucesso!');
  };

  const handleCreateConta = (e: FormEvent) => {
    e.preventDefault();
    if (!contaTitle || !contaDate) {
      showNotification('Por favor, insira o título e a data de lançamento.');
      return;
    }

    const isImgFile = contaFileUrl ? (contaFileUrl.startsWith('data:image/') || contaFileUrl.includes('.jpg') || contaFileUrl.includes('.png')) : false;
    addRecord({
      type: contaType,
      title: contaTitle,
      year: Number(contaYear),
      description: contaDescription,
      date: contaDate.split('-').reverse().join('/'), // format as DD/MM/YYYY
      amount: contaAmount ? parseCurrencyBRL(contaAmount) : undefined,
      category: contaCategory,
      projectLinked: contaProjectLinked || undefined,
      fundingSource: contaFundingSource || undefined,
      fileUrl: contaFileUrl || '#',
      fileName: contaFileName || undefined,
      fileType: isImgFile ? 'photo' : 'document'
    });

    // Reset Form
    setContaTitle('');
    setContaAmount('');
    setContaDate('');
    setContaDescription('');
    setContaProjectLinked('');
    setContaFundingSource('');
    setContaFileUrl('');
    setContaFileError(null);
    setContaFileName(null);
    showNotification('Prestação de contas registrada com sucesso!');
  };

  const handleCreateDoc = (e: FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docDate) {
      showNotification('Por favor, preencha o título e a data.');
      return;
    }

    addRecord({
      type: docType,
      title: docTitle,
      year: Number(docYear),
      description: docDescription,
      date: docDate.split('-').reverse().join('/'),
      fileUrl: docFileUrl || '#'
    });

    setDocTitle('');
    setDocDate('');
    setDocDescription('');
    setDocFileUrl('');
    setDocFileError(null);
    setDocFileName(null);
    showNotification('Documento / ATA registrado com sucesso!');
  };

  const handleCreateEmenda = (e: FormEvent) => {
    e.preventDefault();
    if (!emendaCode || !emendaAuthor || !emendaAmount) {
      showNotification('Código, Autor e Valor são obrigatórios.');
      return;
    }

    const parsedVal = parseCurrencyBRL(emendaAmount);
    if (parsedVal <= 0) {
      showNotification('Por favor, informe um valor de repasse válido.');
      return;
    }

    addEmenda({
      code: emendaCode.toUpperCase(),
      author: emendaAuthor,
      amount: parsedVal,
      year: Number(emendaYear),
      description: emendaDescription,
      allocatedProjectId: emendaProjectLinked || undefined
    });

    setEmendaCode('');
    setEmendaAuthor('');
    setEmendaAmount('');
    setEmendaDescription('');
    setEmendaProjectLinked('');
    showNotification('Nova Emenda Parlamentar cadastrada!');
  };

  const handleCreateProject = (e: FormEvent) => {
    e.preventDefault();
    if (!projTitle) {
      showNotification('O título do projeto é obrigatório.');
      return;
    }

    const parsedIndicators = projIndicatorsStr
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|');
        return {
          value: parts[0]?.trim() || '',
          label: parts[1]?.trim() || ''
        };
      })
      .filter(ind => ind.value && ind.label);

    const parsedTags = projTags.split(',').map(t => t.trim()).filter(Boolean);
    const parsedTerritories = projTerritories.split(',').map(t => t.trim()).filter(Boolean);

    addProject({
      title: projTitle.trim(),
      type: projType,
      category: projCategory.trim() || undefined,
      year: Number(projYear),
      description: projDescription.trim(),
      fullDescription: projFullDescription.trim() || undefined,
      status: projStatus,
      impact: projImpact.trim() || undefined,
      location: projLocation.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      territories: parsedTerritories.length > 0 ? parsedTerritories : undefined,
      indicators: parsedIndicators.length > 0 ? parsedIndicators : undefined,
      mainImage: projMainImage.trim() || undefined,
      budget: projBudget ? parseCurrencyBRL(projBudget) : undefined,
      emendaId: projEmendaId || undefined,
      fundingSourceType: projFundingSourceType.trim() || undefined,
      fundingInstrument: projFundingInstrument.trim() || undefined,
      fundingOrgan: projFundingOrgan.trim() || undefined,
      fundingAuthor: projFundingAuthor.trim() || undefined,
      receivedAmount: projReceivedAmount ? parseCurrencyBRL(projReceivedAmount) : undefined,
      provenExpenses: projProvenExpenses ? parseCurrencyBRL(projProvenExpenses) : undefined
    });

    setProjTitle('');
    setProjDescription('');
    setProjFullDescription('');
    setProjImpact('');
    setProjLocation('');
    setProjTags('');
    setProjTerritories('');
    setProjIndicatorsStr('');
    setProjMainImage('');
    setProjBudget('');
    setProjReceivedAmount('');
    setProjProvenExpenses('');
    setProjFundingInstrument('');
    setProjFundingOrgan('');
    setProjFundingAuthor('');
    setProjEmendaId('');
    showNotification('Novo Projeto cadastrado com sucesso!');
  };

  // Login Form Render
  if (!isAdminLoggedIn) {
    return (
      <div id="admin-login-view" className="bg-slate-50 min-h-screen py-20 px-4 flex flex-col items-center justify-center gap-4">
        {notification && (
          <div className="max-w-md w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-md animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center mx-auto shadow-md">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-indigo-950 tracking-tight">Painel de Administração IFPP</h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Usuário</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Chave de Segurança</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showLoginPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showLoginPassword ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                </button>
              </div>
              {loginError && (
                <p className="text-xs text-rose-500 font-medium mt-1.5">Usuário ou senha incorretos. Por favor, tente novamente.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Autenticar Acesso
            </button>
          </form>

          <div className="text-center border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowResetAdminModal(true);
                setConfirmResetText('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
            >
              Esqueceu a senha do Administrador? Redefinir para o padrão
            </button>
          </div>
        </div>

        {/* Modal de Recuperação de Senha do Admin */}
        {showResetAdminModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
              <div className="p-6">
                <div className="flex items-center gap-3 text-indigo-900 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-full">
                    <Key className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Restaurar Senha do Admin</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Caso tenha perdido o acesso à conta de administrador, você pode redefinir a senha do usuário <strong className="text-slate-900">"admin"</strong> de volta para o padrão: <strong className="text-emerald-700 font-mono">241910</strong>.
                </p>
                
                <div>
                  <label className="block text-slate-500 font-bold mb-1.5 text-xs">Digite a palavra <strong className="text-indigo-950">REDEFINIR</strong> para confirmar:</label>
                  <input
                    type="text"
                    placeholder="REDEFINIR"
                    value={confirmResetText}
                    onChange={(e) => setConfirmResetText(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono uppercase"
                  />
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetAdminModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={confirmResetText.trim().toUpperCase() !== 'REDEFINIR'}
                  onClick={handleRestoreAdminPassword}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer ${
                    confirmResetText.trim().toUpperCase() === 'REDEFINIR'
                      ? 'bg-indigo-900 hover:bg-indigo-950 shadow-xs'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Confirmar Redefinição
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="admin-main-view" className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Sessão Ativa: {loggedInUser?.name} ({loggedInUser?.role === 'admin' ? 'Administrador' : loggedInUser?.role === 'editor' ? 'Editor' : 'Visualizador'})
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight mt-1">
              Painel de Governança e Lançamentos
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            Sair do Painel
          </button>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        {/* Navigation Sidebar Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-3 space-y-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase px-3 py-1">O que deseja gerenciar?</h3>
            
            <button
              onClick={() => setAdminSection('contas')}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminSection === 'contas' ? 'bg-indigo-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Prestações de Contas ({records.filter(r => r.type === 'conta').length})
            </button>

            <button
              onClick={() => setAdminSection('atas')}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminSection === 'atas' ? 'bg-indigo-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              ATAs e Estatutos ({records.filter(r => r.type !== 'conta').length})
            </button>

            <button
              onClick={() => setAdminSection('emendas')}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminSection === 'emendas' ? 'bg-indigo-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Emendas Parlamentares ({emendas.length})
            </button>

            <button
              onClick={() => setAdminSection('projetos')}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminSection === 'projetos' ? 'bg-indigo-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Projetos, Cursos & Eventos ({projects.length})
            </button>

            <div className="h-px bg-slate-100 my-2"></div>
            <h3 className="text-xs font-bold text-slate-400 uppercase px-3 py-1">Minha Conta</h3>

            <button
              onClick={() => setAdminSection('perfil')}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminSection === 'perfil' ? 'bg-indigo-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              Alterar Minha Senha
            </button>

            {loggedInUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setAdminSection('usuarios');
                  if (!newPassword) {
                    setNewPassword(generateRandomPassword());
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  adminSection === 'usuarios' ? 'bg-indigo-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                Gerenciar Usuários ({users.length})
              </button>
            )}
          </div>

          <div className="lg:col-span-9 space-y-8">
            
            {/* ========================================================
                SECTION 1: CONTAS E LANÇAMENTOS 
                ======================================================== */}
            {adminSection === 'contas' && (
              <div className="space-y-6">
                
                {/* Form to insert Accounts */}
                {loggedInUser?.role === 'viewer' ? (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-3.5 text-amber-800 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-sans">Acesso Somente Consulta</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                        Sua conta tem nível de acesso de <strong>Visualizador</strong>. Você pode consultar todos os lançamentos financeiros, relatórios e históricos de auditoria, mas as permissões para criar, editar ou excluir registros estão desabilitadas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-indigo-950">Lançar Novo Balancete ou Prestação de Contas</h3>
                    <p className="text-xs text-slate-500 mt-1">Insira os dados financeiros oficiais de receitas, despesas ou aportes específicos.</p>
                  </div>

                  <form onSubmit={handleCreateConta} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Título do Lançamento *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Prestação de Contas Oficina de Audiovisual - Mês 02"
                        value={contaTitle}
                        onChange={(e) => setContaTitle(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Categoria de Fluxo *</label>
                      <select
                        value={contaCategory}
                        onChange={(e) => setContaCategory(e.target.value as 'receita' | 'despesa')}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="despesa">Saída / Gasto (Despesa de Execução)</option>
                        <option value="receita">Entrada / Recebimento (Aporte/Apoio)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Valor Auditado (BRL) *</label>
                      <CurrencyInput
                        id="conta-amount-input"
                        required
                        value={contaAmount}
                        onChange={setContaAmount}
                        placeholder="Ex: 400.000,00 ou 400 mil"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Data da Movimentação *</label>
                      <input
                        type="date"
                        required
                        value={contaDate}
                        onChange={(e) => setContaDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Exercício/Ano Comercial *</label>
                      <input
                        type="number"
                        required
                        value={contaYear}
                        onChange={(e) => setContaYear(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* VINCULOS CRUCIAIS: Emenda e Projeto */}
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Vincular ao Projeto/Curso/Evento
                      </label>
                      <select
                        value={contaProjectLinked}
                        onChange={(e) => setContaProjectLinked(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">-- Sem vínculo de projeto --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.year})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-slate-400" />
                        Origem (Emenda Financiadora)
                      </label>
                      <select
                        value={contaFundingSource}
                        onChange={(e) => setContaFundingSource(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">-- Sem vínculo de emenda --</option>
                        {emendas.map(e => (
                          <option key={e.id} value={e.id}>{e.code} - {e.author}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                        Arquivo de Prestação de Contas / PDF (Upload do Computador)
                      </label>
                      <div className={`border-2 border-dashed ${contaFileError ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'} rounded-xl p-4 transition-colors relative flex flex-col items-center justify-center text-center group`}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
                          onChange={(e) => handleFileChange(e, 'conta')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-white rounded-full shadow-xs group-hover:text-indigo-600 transition-colors">
                            <UploadCloud className={`w-6 h-6 ${contaFileError ? 'text-red-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                          </div>
                          {contaFileError ? (
                            <div className="text-red-700 px-4">
                              <p className="text-xs font-bold flex items-center gap-1 justify-center">
                                ⚠️ Arquivo rejeitado!
                              </p>
                              <p className="text-[10px] text-red-600 mt-1 max-w-sm leading-tight">
                                {contaFileError}
                              </p>
                            </div>
                          ) : contaFileName ? (
                            <div className="text-slate-700 px-4">
                              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Arquivo pronto: {contaFileName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono max-w-xs truncate text-center">
                                O documento foi carregado e está pronto para salvar.
                              </p>
                            </div>
                          ) : contaFileUrl && contaFileUrl !== '#' ? (
                            <div className="text-slate-700 px-4">
                              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Link Externo Vinculado!
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono max-w-xs truncate text-center">
                                {contaFileUrl}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold text-slate-700">Arraste ou clique para selecionar do computador</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Suporta PDF, Word, Excel, Imagens (Máx: 5MB com compactação automática)</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-left">
                        <span className="text-xs text-slate-400 block mb-1">Ou informe um link externo do documento (Google Drive, Dropbox, etc):</span>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={contaFileUrl && !contaFileUrl.startsWith('data:') && !contaFileUrl.startsWith('chunked|') && contaFileUrl !== '#' ? contaFileUrl : ''}
                          onChange={(e) => setContaFileUrl(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Histórico / Descrição Detalhada</label>
                      <textarea
                        rows={3}
                        placeholder="Descreva detalhadamente a destinação dos recursos contábeis (ex: pagamento de facilitadores, materiais, alimentação dos beneficiários...)"
                        value={contaDescription}
                        onChange={(e) => setContaDescription(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-4">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Confirmar e Publicar Conta
                      </button>
                    </div>

                  </form>
                </div>
                )}

                {/* List of accounts with delete capability */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Lançamentos Financeiros Vigentes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Título / Data</th>
                          <th className="px-4 py-3">Categoria</th>
                          <th className="px-4 py-3 text-right">Valor BRL</th>
                          <th className="px-4 py-3">Relações</th>
                          <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.filter(r => r.type === 'conta').map((record) => {
                          const linkedProj = projects.find(p => p.id === record.projectLinked);
                          const linkedEmenda = emendas.find(e => e.id === record.fundingSource);

                          return (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-slate-900">{record.title}</span>
                                  {record.fileUrl && record.fileUrl !== '#' && (
                                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-bold rounded border border-emerald-100" title={(record.fileUrl.startsWith('data:') || record.fileUrl.startsWith('chunked|')) ? 'Arquivo em anexo (Base64)' : 'Link externo cadastrado'}>
                                      <Paperclip className="w-2.5 h-2.5 text-emerald-600" />
                                      {(record.fileUrl.startsWith('data:') || record.fileUrl.startsWith('chunked|')) ? 'ANEXO PDF' : 'LINK'}
                                    </span>
                                  )}
                                </div>
                                <span className="block text-[10px] text-slate-400 mt-0.5">
                                  {record.date} • Exercício {record.year}
                                  {record.createdByUserName && ` • Criado por: ${record.createdByUserName}`}
                                  {record.updatedByUserName && ` • Alterado por: ${record.updatedByUserName}`}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                {record.category === 'despesa' ? (
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold rounded">Saída</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded">Entrada</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                                {record.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                              <td className="px-4 py-3.5 space-y-1">
                                {linkedProj && (
                                  <span className="block text-[10px] text-slate-500 font-medium truncate max-w-[120px]" title={`Projeto: ${linkedProj.title}`}>
                                    📁 {linkedProj.title}
                                  </span>
                                )}
                                {linkedEmenda && (
                                  <span className="block text-[10px] text-indigo-900 font-bold font-mono">
                                    🏛️ {linkedEmenda.code}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                {loggedInUser?.role !== 'viewer' ? (
                                  <div className="flex justify-center items-center gap-1.5">
                                    <button
                                      onClick={() => handleStartEdit(record)}
                                      className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                      title="Editar Lançamento"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeleteConfirm({
                                          id: record.id,
                                          title: record.title,
                                          type: 'record',
                                          onConfirm: () => {
                                            deleteRecord(record.id);
                                            showNotification('Registro financeiro excluído.');
                                          }
                                        });
                                      }}
                                      className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Deletar Lançamento"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium italic">Sem permissão</span>
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
            )}

            {/* ========================================================
                SECTION 2: ATAS E ESTATUTOS 
                ======================================================== */}
            {adminSection === 'atas' && (
              <div className="space-y-6">
                
                {loggedInUser?.role === 'viewer' ? (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-3.5 text-amber-800 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-sans">Acesso Somente Consulta</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                        Sua conta tem nível de acesso de <strong>Visualizador</strong>. Você pode consultar todas as ATAs, estatutos, balancetes e históricos de auditoria, mas as permissões para criar, editar ou excluir registros estão desabilitadas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-indigo-950">Registrar ATA de Reunião ou Atualizar Estatuto</h3>
                    <p className="text-xs text-slate-500 mt-1">Controle formal de assembleias da diretoria executiva e pareceres fiscais do IFPP.</p>
                  </div>

                  <form onSubmit={handleCreateDoc} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Título do Documento *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ata da Assembleia Geral de Contas do Exercício de 2025"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Tipo de Documento *</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as RecordType)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="ata">ATA de Assembleia ou Reunião Ordinária</option>
                        <option value="estatuto">Estatuto Social de Governança</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Data de Assinatura/Publicação *</label>
                      <input
                        type="date"
                        required
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Ano do Exercício Comercial *</label>
                      <input
                        type="number"
                        required
                        value={docYear}
                        onChange={(e) => setDocYear(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                        Arquivo do Documento / ATA (Upload do Computador)
                      </label>
                      <div className={`border-2 border-dashed ${docFileError ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'} rounded-xl p-4 transition-colors relative flex flex-col items-center justify-center text-center group`}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
                          onChange={(e) => handleFileChange(e, 'doc')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-white rounded-full shadow-xs group-hover:text-indigo-600 transition-colors">
                            <UploadCloud className={`w-6 h-6 ${docFileError ? 'text-red-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                          </div>
                          {docFileError ? (
                            <div className="text-red-700 px-4">
                              <p className="text-xs font-bold flex items-center gap-1 justify-center">
                                ⚠️ Arquivo rejeitado!
                              </p>
                              <p className="text-[10px] text-red-600 mt-1 max-w-sm leading-tight">
                                {docFileError}
                              </p>
                            </div>
                          ) : docFileName ? (
                            <div className="text-slate-700 px-4">
                              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Arquivo pronto: {docFileName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono max-w-xs truncate text-center">
                                O documento foi carregado e está pronto para salvar.
                              </p>
                            </div>
                          ) : docFileUrl && docFileUrl !== '#' ? (
                            <div className="text-slate-700 px-4">
                              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Link Externo Vinculado!
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono max-w-xs truncate text-center">
                                {docFileUrl}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold text-slate-700">Arraste ou clique para selecionar do computador</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Suporta PDF, Word, Excel, Imagens (Máx: 5MB com compactação automática)</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-left">
                        <span className="text-xs text-slate-400 block mb-1">Ou informe um link externo do documento (Google Drive, Dropbox, etc):</span>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={docFileUrl && !docFileUrl.startsWith('data:') && !docFileUrl.startsWith('chunked|') && docFileUrl !== '#' ? docFileUrl : ''}
                          onChange={(e) => setDocFileUrl(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Sumário Executivo / Ementa do Documento</label>
                      <textarea
                        rows={3}
                        placeholder="Sumarize as principais resoluções aprovadas neste documento para controle social do público..."
                        value={docDescription}
                        onChange={(e) => setDocDescription(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-4">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Registrar Documento Público
                      </button>
                    </div>

                  </form>
                </div>
                )}

                {/* List of documents */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">ATAs e Estatutos Disponibilizados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {records.filter(r => r.type !== 'conta').map((doc) => (
                      <div key={doc.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-start">
                        <div>
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded mb-1.5 ${
                            doc.type === 'estatuto' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {doc.type.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-indigo-950 text-xs sm:text-sm">{doc.title}</h4>
                            {doc.fileUrl && doc.fileUrl !== '#' && (
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-bold rounded border border-emerald-100 shrink-0" title={(doc.fileUrl.startsWith('data:') || doc.fileUrl.startsWith('chunked|')) ? 'Arquivo em anexo (Base64)' : 'Link externo cadastrado'}>
                                <Paperclip className="w-2.5 h-2.5 text-emerald-600" />
                                {(doc.fileUrl.startsWith('data:') || doc.fileUrl.startsWith('chunked|')) ? 'PDF' : 'LINK'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">
                            Registrado em: {doc.date} • Ref: {doc.year}
                            {doc.createdByUserName && ` • Criado por: ${doc.createdByUserName}`}
                            {doc.updatedByUserName && ` • Alterado por: ${doc.updatedByUserName}`}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doc.description}</p>
                        </div>
                        {loggedInUser?.role !== 'viewer' && (
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            <button
                              onClick={() => handleStartEdit(doc)}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                              title="Editar Documento"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  id: doc.id,
                                  title: doc.title,
                                  type: 'record',
                                  onConfirm: () => {
                                    deleteRecord(doc.id);
                                    showNotification('Documento social excluído.');
                                  }
                                });
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Excluir Documento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
                SECTION 3: EMENDAS PARLAMENTARES 
                ======================================================== */}
            {adminSection === 'emendas' && (
              <div className="space-y-6">
                
                {loggedInUser?.role === 'viewer' ? (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-3.5 text-amber-800 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-sans">Acesso Somente Consulta</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                        Sua conta tem nível de acesso de <strong>Visualizador</strong>. Você pode consultar todas as emendas parlamentares, destinações e históricos de auditoria, mas as permissões para criar, editar ou excluir registros estão desabilitadas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-indigo-950">Cadastrar Nova Emenda Parlamentar</h3>
                    <p className="text-xs text-slate-500 mt-1">Cadastre as verbas oficiais aprovadas para o IFPP e vincule-as a cursos e oficinas.</p>
                  </div>

                  <form onSubmit={handleCreateEmenda} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Código Único da Emenda *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: EMENDA-2026-455"
                        value={emendaCode}
                        onChange={(e) => setEmendaCode(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Autor/Parlamentar Responsável *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Deputado Estadual João Pereira"
                        value={emendaAuthor}
                        onChange={(e) => setEmendaAuthor(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Valor do Repasse (BRL) *</label>
                      <CurrencyInput
                        id="emenda-amount-input"
                        required
                        value={emendaAmount}
                        onChange={setEmendaAmount}
                        placeholder="Ex: 400.000,00 ou 400 mil"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Ano do Repasse *</label>
                      <input
                        type="number"
                        required
                        value={emendaYear}
                        onChange={(e) => setEmendaYear(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Vincular Diretamente ao Projeto do IFPP</label>
                      <select
                        value={emendaProjectLinked}
                        onChange={(e) => setEmendaProjectLinked(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">-- Deixar sem vínculo por enquanto --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.year})</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Ementa de Destinação</label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Apoio à melhoria de infraestrutura educativa e oficinas de lazer..."
                        value={emendaDescription}
                        onChange={(e) => setEmendaDescription(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-4">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Salvar Emenda Parlamentar
                      </button>
                    </div>

                  </form>
                </div>
                )}

                {/* List of emendas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Emendas Parlamentares Cadastradas</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Código / Ano</th>
                          <th className="px-4 py-3">Autor</th>
                          <th className="px-4 py-3 text-right">Valor Aporte</th>
                          <th className="px-4 py-3">Destinação</th>
                          <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {emendas.map((e) => {
                          const linkedProj = projects.find(p => p.id === e.allocatedProjectId);
                          return (
                            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3.5 font-mono font-bold text-indigo-950">
                                {e.code}
                                <span className="block text-[9px] text-slate-400 font-normal">
                                  Exercício {e.year}
                                  {e.createdByUserName && ` • Criado por: ${e.createdByUserName}`}
                                  {e.updatedByUserName && ` • Alterado por: ${e.updatedByUserName}`}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-medium">{e.author}</td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                                {e.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                              <td className="px-4 py-3.5">
                                {linkedProj ? (
                                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-950 rounded font-semibold text-[10px]">
                                    {linkedProj.title}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-600 font-medium italic">Pendente de vinculação</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                {loggedInUser?.role !== 'viewer' ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleStartEditEmenda(e)}
                                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                                      title="Editar Demanda / Emenda"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeleteConfirm({
                                          id: e.id,
                                          title: e.code,
                                          type: 'emenda',
                                          onConfirm: () => {
                                            deleteEmenda(e.id);
                                            showNotification('Emenda excluída do sistema.');
                                          }
                                        });
                                      }}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      title="Excluir Emenda"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium italic">Sem permissão</span>
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
            )}

            {/* ========================================================
                SECTION 4: PROJETOS, CURSOS & EVENTOS 
                ======================================================== */}
            {adminSection === 'projetos' && (
              <div className="space-y-6">
                
                {loggedInUser?.role === 'viewer' ? (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-3.5 text-amber-800 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-sans">Acesso Somente Consulta</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                        Sua conta tem nível de acesso de <strong>Visualizador</strong>. Você pode consultar todas as iniciativas, cursos, oficinas, estatutos, balancetes e históricos de auditoria, mas as permissões para criar, editar ou excluir registros estão desabilitadas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-indigo-950">Cadastrar Novo Projeto, Curso ou Evento</h3>
                    <p className="text-xs text-slate-500 mt-1">Crie as fichas que detalham oficinas, seminários e ações comunitárias do IFPP.</p>
                  </div>

                  <form onSubmit={handleCreateProject} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Nome da Ação / Projeto / Curso *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Sonhos da Juventude"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Categoria Temática</label>
                      <input
                        type="text"
                        placeholder="Ex: Formação / Juventude, Cultura, Educação"
                        value={projCategory}
                        onChange={(e) => setProjCategory(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Tags (separadas por vírgula)</label>
                      <input
                        type="text"
                        placeholder="Ex: Fotografia, Audiovisual, Mídias Sociais"
                        value={projTags}
                        onChange={(e) => setProjTags(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Tipo de Iniciativa *</label>
                      <select
                        value={projType}
                        onChange={(e) => setProjType(e.target.value as ProjectType)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="projeto">Projeto Social / Formativo</option>
                        <option value="curso">Curso / Oficina Livre</option>
                        <option value="evento">Evento Cultural / Festival</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Status *</label>
                      <select
                        value={projStatus}
                        onChange={(e) => setProjStatus(e.target.value as Project['status'])}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="em_andamento">Em andamento</option>
                        <option value="concluido">Concluído</option>
                        <option value="aprovado">Aprovado (Aguardando Recurso)</option>
                        <option value="planejado">Planejado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Ano</label>
                      <input
                        type="number"
                        value={projYear}
                        onChange={(e) => setProjYear(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Localização / Cidades</label>
                      <input
                        type="text"
                        placeholder="Ex: Niterói, São Gonçalo e Rio de Janeiro"
                        value={projLocation}
                        onChange={(e) => setProjLocation(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5 flex items-center justify-between">
                        <span>Foto Principal do Projeto (Capa / Destaque)</span>
                        {projMainImage && (
                          <button
                            type="button"
                            onClick={() => setProjMainImage('')}
                            className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                          >
                            Remover Foto
                          </button>
                        )}
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-4">
                          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer text-xs font-bold text-indigo-900 transition-colors">
                            <UploadCloud className="w-4 h-4 text-indigo-600" />
                            <span>Upload da Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                try {
                                  const dataUrl = await processImageFile(f);
                                  setProjMainImage(dataUrl);
                                  showNotification('Foto carregada e otimizada!');
                                } catch (err: any) {
                                  alert(err.message || 'Erro ao carregar imagem.');
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="sm:col-span-8 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ou informe URL da imagem (https://...)"
                            value={projMainImage && !projMainImage.startsWith('data:') ? projMainImage : ''}
                            onChange={(e) => setProjMainImage(e.target.value)}
                            className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          {projMainImage && (
                            <img src={projMainImage} alt="Prévia" className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Resumo Curto (3 a 4 linhas para os cards)</label>
                      <textarea
                        rows={2}
                        placeholder="Resumo conciso de até 3 ou 4 linhas para exibição no card do projeto..."
                        value={projDescription}
                        onChange={(e) => setProjDescription(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Descrição Completa (para a página individual do projeto)</label>
                      <textarea
                        rows={4}
                        placeholder="Detalhamento integral dos objetivos, métodos, beneficiários e impacto social..."
                        value={projFullDescription}
                        onChange={(e) => setProjFullDescription(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Indicadores Reais de Impacto (um por linha no formato: Valor | Rótulo)</label>
                      <textarea
                        rows={3}
                        placeholder={"+1.290 | Participantes\n+40 | Oficinas e debates\n+240h | Atividades\n3 | Municípios\n8 | Localidades"}
                        value={projIndicatorsStr}
                        onChange={(e) => setProjIndicatorsStr(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Insira cada métrica com valor e rótulo separados por uma barra vertical (|)</span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 font-bold mb-1.5">Territórios e Localidades Atendidas (separados por vírgula)</label>
                      <input
                        type="text"
                        placeholder="Ex: Niterói (Morro do Estado), São Gonçalo (Complexo do Salgueiro), Rio de Janeiro (Madureira)"
                        value={projTerritories}
                        onChange={(e) => setProjTerritories(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Transparência e Financiamento */}
                    <div className="sm:col-span-2 pt-3 border-t border-slate-200/80">
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">Transparência e Financiamento</h4>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Fonte do Recurso</label>
                      <input
                        type="text"
                        placeholder="Ex: Emenda Parlamentar, Recurso Próprio, Edital, Convênio"
                        value={projFundingSourceType}
                        onChange={(e) => setProjFundingSourceType(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Instrumento / Identificação</label>
                      <input
                        type="text"
                        placeholder="Ex: EMENDA-2022-382, Edital 01/2023"
                        value={projFundingInstrument}
                        onChange={(e) => setProjFundingInstrument(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Órgão Responsável pelo Repasse</label>
                      <input
                        type="text"
                        placeholder="Ex: Ministério da Educação, Governo do Estado do RJ"
                        value={projFundingOrgan}
                        onChange={(e) => setProjFundingOrgan(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Autor da Emenda (quando houver)</label>
                      <input
                        type="text"
                        placeholder="Ex: Deputado Estadual André Silva"
                        value={projFundingAuthor}
                        onChange={(e) => setProjFundingAuthor(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Recurso Recebido (R$)</label>
                      <CurrencyInput
                        id="proj-received-input"
                        value={projReceivedAmount}
                        onChange={setProjReceivedAmount}
                        placeholder="Ex: 150.000,00"
                        showQuickChips={false}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">Despesas Comprovadas (R$)</label>
                      <CurrencyInput
                        id="proj-proven-input"
                        value={projProvenExpenses}
                        onChange={setProjProvenExpenses}
                        placeholder="Ex: 150.000,00"
                        showQuickChips={false}
                      />
                    </div>

                    <div className="sm:col-span-2 pt-4">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Salvar Nova Iniciativa
                      </button>
                    </div>

                  </form>
                </div>
                )}

                {/* List of projects */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Iniciativas Cadastradas no IFPP</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((p) => {
                      const fund = emendas.find(e => e.id === p.emendaId);
                      const projRecords = records.filter(r => r.projectLinked === p.id);
                      const projPhotos = projRecords.filter(r => 
                        r.fileType === 'photo' || 
                        (r.fileUrl && (r.fileUrl.startsWith('data:image/') || r.fileUrl.includes('.jpg') || r.fileUrl.includes('.png') || r.fileUrl.includes('.jpeg') || r.fileUrl.includes('.webp')))
                      );
                      const projDocs = projRecords.filter(r => !projPhotos.includes(r));

                      return (
                        <div key={p.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex gap-1.5 items-center">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 text-[9px] font-bold rounded capitalize">
                                  {p.type}
                                </span>
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                  p.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' :
                                  p.status === 'em_andamento' ? 'bg-amber-100 text-amber-800' :
                                  p.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {p.status === 'concluido' ? 'Concluído' :
                                   p.status === 'em_andamento' ? 'Em Execução' :
                                   p.status === 'aprovado' ? 'Aprovado (Aguardando Recurso)' : 'Planejado'}
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5">{p.title}</h4>
                              {p.status === 'aprovado' && (
                                <p className="text-[10px] text-blue-700 bg-blue-50/70 border border-blue-100 rounded px-2 py-0.5 mt-1 font-medium">
                                  ⏳ Aprovado • Aguardando repasse do valor financeiro
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400 mt-1">
                                Ano: {p.year} • {p.location || 'Sem local'}
                                {p.createdByUserName && ` • Criado por: ${p.createdByUserName}`}
                                {p.updatedByUserName && ` • Alterado por: ${p.updatedByUserName}`}
                              </p>
                              
                              {fund && (
                                <p className="text-[10px] font-mono text-indigo-900 font-bold mt-1.5">
                                  🏛️ Financiador: {fund.code} ({fund.author})
                                </p>
                              )}
                            </div>
                            {loggedInUser?.role !== 'viewer' && (
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button
                                  type="button"
                                  onClick={() => setProjectToManageImages(p)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                                  title="Adicionar, alterar ou excluir imagens deste projeto"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStartEditProject(p)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                                  title="Editar Iniciativa / Projeto"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteConfirm({
                                      id: p.id,
                                      title: p.title,
                                      type: 'project',
                                      onConfirm: () => {
                                        deleteProject(p.id);
                                        showNotification('Iniciativa excluída do sistema.');
                                      }
                                    });
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Excluir Iniciativa"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Direct project files management button and pills */}
                          <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                              <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200/60">
                                <ImageIcon className="w-3 h-3 text-amber-600" />
                                {(p.gallery?.length || 0) + (p.mainImage ? 1 : 0)} fotos
                              </span>
                              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100/50">
                                <FileText className="w-3 h-3 text-emerald-600" />
                                {projDocs.length} docs
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setProjectToManageImages(p)}
                                className="text-[11px] font-bold text-amber-800 hover:text-white bg-amber-50 hover:bg-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                title="Adicionar, alterar e excluir imagens deste projeto individual"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                Gerenciar Imagens
                              </button>
                              <button
                                type="button"
                                onClick={() => setProjectToManageFiles(p)}
                                className="text-[11px] font-bold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                title="Cadastrar ou gerenciar fotos e documentos deste projeto"
                              >
                                <UploadCloud className="w-3.5 h-3.5" />
                                Anexar Fotos / Docs
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
                SECTION 5: GERENCIAR USUÁRIOS
                ======================================================== */}
            {adminSection === 'usuarios' && loggedInUser?.role === 'admin' && (
              <div className="space-y-6">
                
                {/* Form to insert user */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-indigo-950">Criar Novo Usuário</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Adicione novos membros com credenciais exclusivas e defina seus níveis de privilégio no sistema.
                    </p>
                  </div>

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">Nome do Usuário *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João Silva"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">Login de Acesso *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: joao.silva (letras minúsculas)"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-slate-500 font-bold font-sans">Senha do Usuário *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPassword(generateRandomPassword());
                            showNotification('Nova senha aleatória gerada!');
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Gerar Outra Senha
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          placeholder="Ex: Senha123"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-2.5 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showNewPassword ? "Ocultar senha" : "Exibir senha"}
                        >
                          {showNewPassword ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">Nível de Permissão *</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      >
                        <option value="editor">Editor (Pode criar e alterar documentos)</option>
                        <option value="viewer">Visualizador (Somente consulta ao painel)</option>
                        <option value="admin">Administrador (Acesso total + Gerenciamento de Usuários)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 pt-4">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Criar Conta de Acesso
                      </button>
                    </div>
                  </form>
                </div>

                {/* List of existing users */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 font-sans">Usuários Cadastrados no Painel</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Nome Completo</th>
                          <th className="px-4 py-3">Usuário / Login</th>
                          <th className="px-4 py-3">Perfil / Acesso</th>
                          <th className="px-4 py-3 text-center">Redefinir Senha</th>
                          <th className="px-4 py-3 text-center">Excluir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-slate-950">{u.name}</td>
                            <td className="px-4 py-3.5 font-mono text-slate-500">{u.username}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${
                                u.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-100' :
                                u.role === 'editor' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                'bg-slate-50 text-slate-600 border border-slate-100'
                              }`}>
                                {u.role === 'admin' ? 'Administrador' : u.role === 'editor' ? 'Editor' : 'Visualizador'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {u.username === 'admin' ? (
                                <span className="text-[10px] text-slate-400 font-medium italic">Bloqueado</span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setUserToResetPassword(u);
                                    setTempResetPassword(generateRandomPassword());
                                  }}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                  title="Redefinir Senha do Usuário"
                                >
                                  <Key className="w-4 h-4" />
                                  <span className="text-[10px] font-bold">Redefinir</span>
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {u.username === 'admin' ? (
                                <span className="text-[10px] text-slate-400 font-medium italic">Inexcluível</span>
                              ) : (
                                <button
                                  onClick={async () => {
                                    setDeleteConfirm({
                                      id: u.id,
                                      title: u.name,
                                      type: 'user',
                                      onConfirm: async () => {
                                        await onDeleteUser(u.id);
                                        showNotification('Usuário excluído com sucesso.');
                                      }
                                    });
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Remover Usuário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
                SECTION 6: ALTERAR MINHA SENHA
                ======================================================== */}
            {adminSection === 'perfil' && (
              <div className="space-y-6">
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-indigo-950 font-sans">Alterar Minha Senha</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Mantenha suas credenciais seguras atualizando sua chave de acesso periodicamente.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="max-w-md space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">Senha Atual *</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          placeholder="Sua senha de login atual"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-2.5 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showCurrentPassword ? "Ocultar senha" : "Exibir senha"}
                        >
                          {showCurrentPassword ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">Nova Senha *</label>
                      <div className="relative">
                        <input
                          type={showProfileNewPassword ? "text" : "password"}
                          required
                          placeholder="Mínimo de 4 caracteres"
                          value={newProfilePassword}
                          onChange={(e) => setNewProfilePassword(e.target.value)}
                          className="w-full pl-2.5 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfileNewPassword(!showProfileNewPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showProfileNewPassword ? "Ocultar senha" : "Exibir senha"}
                        >
                          {showProfileNewPassword ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">Confirmar Nova Senha *</label>
                      <div className="relative">
                        <input
                          type={showConfirmProfilePassword ? "text" : "password"}
                          required
                          placeholder="Digite a nova senha novamente"
                          value={confirmProfilePassword}
                          onChange={(e) => setConfirmProfilePassword(e.target.value)}
                          className="w-full pl-2.5 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmProfilePassword(!showConfirmProfilePassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showConfirmProfilePassword ? "Ocultar senha" : "Exibir senha"}
                        >
                          {showConfirmProfilePassword ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Salvar Nova Senha
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <div className="p-2 bg-rose-50 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você está prestes a excluir definitivamente o item <strong className="text-slate-900">"{deleteConfirm.title}"</strong>. Esta ação não poderá ser desfeita e removerá os dados do portal público.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs shadow-rose-200 cursor-pointer"
              >
                Sim, Excluir item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-950 text-white">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="text-sm font-bold">Editar Registro de Transparência</h3>
                  <p className="text-[10px] text-indigo-200">ID: {editingRecord.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-lg hover:bg-indigo-900 transition-colors text-indigo-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-500 font-bold mb-1">Título do Documento / Lançamento *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  placeholder="Ex: Ata da Assembleia Geral..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tipo de Registro *</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as RecordType)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="conta">Prestação de Contas (Lançamento)</option>
                    <option value="ata">ATA de Reunião</option>
                    <option value="estatuto">Estatuto Social</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Ano de Referência *</label>
                  <input
                    type="number"
                    required
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Data do Lançamento/Documento *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                    Upload de Novo Arquivo (do Computador)
                  </label>
                  <div className={`border-2 border-dashed ${editFileError ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'} rounded-xl p-3 transition-colors relative flex flex-col items-center justify-center text-center group`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
                      onChange={(e) => handleFileChange(e, 'edit')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-1.5">
                      <UploadCloud className={`w-5 h-5 ${editFileError ? 'text-red-400' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}`} />
                      {editFileError ? (
                        <div className="text-red-700 px-2">
                          <p className="text-[10px] font-bold flex items-center gap-1 justify-center">
                            ⚠️ Rejeitado
                          </p>
                          <p className="text-[8px] text-red-500 mt-0.5 max-w-[180px] leading-tight">
                            {editFileError}
                          </p>
                        </div>
                      ) : editFileName ? (
                        <div className="text-slate-700 px-2">
                          <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Pronto: {editFileName}
                          </p>
                          <p className="text-[8px] text-slate-400 text-center">
                            Arquivo carregado com sucesso.
                          </p>
                        </div>
                      ) : editFileUrl && editFileUrl !== '#' ? (
                        <div className="text-slate-700 px-2">
                          <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Link Vinculado!
                          </p>
                          <p className="text-[8px] text-slate-400 max-w-[180px] truncate text-center">
                            {editFileUrl}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-700">Escolha um novo arquivo</p>
                          <p className="text-[8px] text-slate-400">PDF, Word, Imagem (Máx: 5MB com compactação automática)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-left">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Ou informe o link externo do documento:</span>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={editFileUrl && !editFileUrl.startsWith('data:') && !editFileUrl.startsWith('chunked|') && editFileUrl !== '#' ? editFileUrl : ''}
                      onChange={(e) => setEditFileUrl(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-sans"
                    />
                  </div>
                </div>
              </div>

              {editType === 'conta' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  <span className="block font-bold text-indigo-950 text-[10px] uppercase tracking-wider">Dados Financeiros Extras</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Categoria de Fluxo</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as 'receita' | 'despesa')}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="receita">Entrada (Receita)</option>
                        <option value="despesa">Saída (Despesa)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Valor do Lançamento (BRL)</label>
                      <CurrencyInput
                        id="edit-amount-input"
                        value={editAmount}
                        onChange={setEditAmount}
                        placeholder="Ex: 400.000,00 ou 400 mil"
                        showQuickChips={false}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Vincular ao Projeto/Iniciativa</label>
                      <select
                        value={editProjectLinked}
                        onChange={(e) => setEditProjectLinked(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">-- Sem vínculo de projeto --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.year})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Vincular à Emenda de Origem</label>
                      <select
                        value={editFundingSource}
                        onChange={(e) => setEditFundingSource(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">-- Sem fomento de emenda --</option>
                        {emendas.map(em => (
                          <option key={em.id} value={em.id}>{em.code} - {em.author}</option>
                        ))}
                      </select>
                    </div>

                    {editProjectLinked && (
                      <div className="sm:col-span-2">
                        <label className="block text-slate-500 font-bold mb-1">
                          Categoria em "Documentos e Comprovantes Vinculados"
                        </label>
                        <select
                          value={editDocCategory || 'notas_fiscais'}
                          onChange={(e) => setEditDocCategory(e.target.value as RecordDocCategory)}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                          <option value="notas_fiscais">🧾 Notas fiscais e comprovantes</option>
                          <option value="prestacao_contas">📊 Prestação de contas</option>
                          <option value="relatorios">📄 Relatórios de atividades</option>
                          <option value="termos_parceria">📑 Termos / Parcerias</option>
                          <option value="outros">📷 Outros documentos / Fotos</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-bold mb-1">Histórico / Detalhamento do Registro</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Sumarize as principais resoluções ou finalidade..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Emenda (Demanda) Modal */}
      {editingEmenda && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-950 text-white">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="text-sm font-bold">Editar Demanda / Emenda Parlamentar</h3>
                  <p className="text-[10px] text-indigo-200">ID: {editingEmenda.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmenda(null)}
                className="p-1 rounded-lg hover:bg-indigo-900 transition-colors text-indigo-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmenda} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-500 font-bold mb-1">Código / Identificador da Emenda *</label>
                <input
                  type="text"
                  required
                  value={editEmendaCode}
                  onChange={(e) => setEditEmendaCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-800"
                  placeholder="Ex: EMENDA-2024-045"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Parlamentar / Autoridade Proponente *</label>
                <input
                  type="text"
                  required
                  value={editEmendaAuthor}
                  onChange={(e) => setEditEmendaAuthor(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  placeholder="Ex: Dep. Federal Fulano de Tal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Valor do Aporte (R$) *</label>
                  <CurrencyInput
                    id="edit-emenda-amount-input"
                    required
                    value={editEmendaAmount}
                    onChange={setEditEmendaAmount}
                    placeholder="Ex: 400.000,00 ou 400 mil"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Ano do Exercício / Repasse *</label>
                  <input
                    type="number"
                    required
                    value={editEmendaYear}
                    onChange={(e) => setEditEmendaYear(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Vincular Diretamente ao Projeto do IFPP</label>
                <select
                  value={editEmendaProjectLinked}
                  onChange={(e) => setEditEmendaProjectLinked(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                >
                  <option value="">-- Deixar sem vínculo por enquanto --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Ementa de Destinação / Descrição</label>
                <textarea
                  rows={3}
                  value={editEmendaDescription}
                  onChange={(e) => setEditEmendaDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  placeholder="Ex: Apoio à melhoria de infraestrutura educativa e oficinas..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmenda(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Project (Iniciativa/Curso) Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-950 text-white">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="text-sm font-bold">Editar Projeto / Iniciativa</h3>
                  <p className="text-[10px] text-indigo-200">ID: {editingProject.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg hover:bg-indigo-900 transition-colors text-indigo-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nome da Ação / Projeto *</label>
                <input
                  type="text"
                  required
                  value={editProjTitle}
                  onChange={(e) => setEditProjTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Categoria Temática</label>
                  <input
                    type="text"
                    value={editProjCategory}
                    onChange={(e) => setEditProjCategory(e.target.value)}
                    placeholder="Ex: Formação / Juventude"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={editProjTags}
                    onChange={(e) => setEditProjTags(e.target.value)}
                    placeholder="Fotografia, Audiovisual, Mídias Sociais"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tipo *</label>
                  <select
                    value={editProjType}
                    onChange={(e) => setEditProjType(e.target.value as ProjectType)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="projeto">Projeto Social</option>
                    <option value="curso">Curso / Oficina</option>
                    <option value="evento">Evento Cultural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Ano *</label>
                  <input
                    type="number"
                    required
                    value={editProjYear}
                    onChange={(e) => setEditProjYear(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Status *</label>
                  <select
                    value={editProjStatus}
                    onChange={(e) => setEditProjStatus(e.target.value as Project['status'])}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="aprovado">Aprovado (Aguardando Recurso)</option>
                    <option value="planejado">Planejado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Localização</label>
                  <input
                    type="text"
                    value={editProjLocation}
                    onChange={(e) => setEditProjLocation(e.target.value)}
                    placeholder="Ex: Niterói, São Gonçalo e Rio de Janeiro"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      Foto Principal (Capa / Destaque)
                    </label>
                    {editProjMainImage && (
                      <button
                        type="button"
                        onClick={() => setEditProjMainImage('')}
                        className="text-[10px] text-rose-600 font-semibold hover:underline cursor-pointer"
                      >
                        Excluir Foto Principal
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      {editProjMainImage ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={editProjMainImage} alt="Foto Principal" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 text-center p-2">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px]">Sem Foto</span>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-8 space-y-2">
                      <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 cursor-pointer font-bold text-indigo-900 text-xs transition-colors">
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span>Upload Nova Foto Principal</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            try {
                              const dataUrl = await processImageFile(f);
                              setEditProjMainImage(dataUrl);
                              showNotification('Foto principal carregada e otimizada!');
                            } catch (err: any) {
                              alert(err.message || 'Erro ao carregar foto.');
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={editProjMainImage && !editProjMainImage.startsWith('data:') ? editProjMainImage : ''}
                        onChange={(e) => setEditProjMainImage(e.target.value)}
                        placeholder="Ou informe URL da imagem (https://...)"
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Galeria de Fotos do Projeto dentro do modal de edição */}
                <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      Galeria de Fotos ({editProjGallery.length} {editProjGallery.length === 1 ? 'foto' : 'fotos'})
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {editProjGallery.map((img, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                        <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditProjGallery(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Excluir da Galeria"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200/60 items-center">
                    <label className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:border-indigo-500 bg-white cursor-pointer font-bold text-slate-700 text-xs shadow-xs">
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload de Foto para Galeria</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const dataUrl = await processImageFile(f);
                            setEditProjGallery(prev => [...prev, dataUrl]);
                            showNotification('Foto adicionada à galeria!');
                          } catch (err: any) {
                            alert(err.message || 'Erro ao processar foto.');
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-2 w-full">
                      <input
                        type="text"
                        value={newEditGalleryUrl}
                        onChange={(e) => setNewEditGalleryUrl(e.target.value)}
                        placeholder="Ou cole a URL da foto..."
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newEditGalleryUrl.trim()) return;
                          setEditProjGallery(prev => [...prev, newEditGalleryUrl.trim()]);
                          setNewEditGalleryUrl('');
                          showNotification('Foto adicionada à galeria!');
                        }}
                        disabled={!newEditGalleryUrl.trim()}
                        className="px-3 py-2 bg-indigo-900 text-white text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Resumo Curto (3 a 4 linhas para os cards)</label>
                <textarea
                  rows={2}
                  value={editProjDesc}
                  onChange={(e) => setEditProjDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Resumo de no máximo 3 ou 4 linhas..."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Descrição Completa (para a página individual)</label>
                <textarea
                  rows={4}
                  value={editProjFullDesc}
                  onChange={(e) => setEditProjFullDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Detalhamento completo do projeto..."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Indicadores Reais de Impacto (um por linha no formato: Valor | Rótulo)</label>
                <textarea
                  rows={3}
                  value={editProjIndicatorsStr}
                  onChange={(e) => setEditProjIndicatorsStr(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={"+1.290 | Participantes\n+40 | Oficinas e debates\n3 | Municípios"}
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Territórios e Localidades Atendidas</label>
                <input
                  type="text"
                  value={editProjTerritories}
                  onChange={(e) => setEditProjTerritories(e.target.value)}
                  placeholder="Niterói (Morro do Estado), São Gonçalo..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Transparência e Prestação de Contas */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">Transferegov e Formalização da Proposta</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Nº Proposta Transferegov</label>
                    <input
                      type="text"
                      value={editProjProposalNumber}
                      onChange={(e) => setEditProjProposalNumber(e.target.value)}
                      placeholder="Ex: 010962/2026 ou 029397/2026"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Programa</label>
                    <input
                      type="text"
                      value={editProjProgramName}
                      onChange={(e) => setEditProjProgramName(e.target.value)}
                      placeholder="Ex: Fomento à Cultura, Esporte e Lazer"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-bold mb-1">Objeto Oficial da Proposta</label>
                    <textarea
                      rows={2}
                      value={editProjOfficialObject}
                      onChange={(e) => setEditProjOfficialObject(e.target.value)}
                      placeholder="Descrição oficial do objeto cadastrado no Transferegov..."
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Órgão Concedente</label>
                    <input
                      type="text"
                      value={editProjGrantingOrgan}
                      onChange={(e) => setEditProjGrantingOrgan(e.target.value)}
                      placeholder="Ex: Ministério do Esporte, Ministério da Cultura"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Nº do Processo</label>
                    <input
                      type="text"
                      value={editProjProcessNumber}
                      onChange={(e) => setEditProjProcessNumber(e.target.value)}
                      placeholder="Ex: 71000.012345/2026-00"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Nº da Emenda</label>
                    <input
                      type="text"
                      value={editProjEmendaNumber}
                      onChange={(e) => setEditProjEmendaNumber(e.target.value)}
                      placeholder="Ex: 50040001"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Autor / Indicação Parlamentar</label>
                    <input
                      type="text"
                      value={editProjAuthorIndication}
                      onChange={(e) => setEditProjAuthorIndication(e.target.value)}
                      placeholder="Ex: Comissão de Cultura (Indicação 22891)"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Valor Global (R$)</label>
                    <CurrencyInput
                      id="edit-proj-global-value"
                      value={editProjGlobalValue}
                      onChange={setEditProjGlobalValue}
                      placeholder="Ex: 530.000,00"
                      showQuickChips={false}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Valor de Repasse (R$)</label>
                    <CurrencyInput
                      id="edit-proj-transfer-value"
                      value={editProjTransferValue}
                      onChange={setEditProjTransferValue}
                      placeholder="Ex: 530.000,00"
                      showQuickChips={false}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Contrapartida (R$)</label>
                    <CurrencyInput
                      id="edit-proj-counterpart-value"
                      value={editProjCounterpartValue}
                      onChange={setEditProjCounterpartValue}
                      placeholder="Ex: 0,00"
                      showQuickChips={false}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Nº do Instrumento / Termo</label>
                    <input
                      type="text"
                      value={editProjInstrumentNumber}
                      onChange={(e) => setEditProjInstrumentNumber(e.target.value)}
                      placeholder="Ex: Termo de Fomento nº 912345/2026"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Detalhamento Operacional */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">Metas, Público e Territórios</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-bold mb-1">Objetivos e Metas Oficiais</label>
                    <textarea
                      rows={3}
                      value={editProjGoalsAndObjectives}
                      onChange={(e) => setEditProjGoalsAndObjectives(e.target.value)}
                      placeholder="Metas quantitativas e qualitativas da iniciativa..."
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Público Beneficiário</label>
                    <input
                      type="text"
                      value={editProjTargetAudience}
                      onChange={(e) => setEditProjTargetAudience(e.target.value)}
                      placeholder="Ex: Crianças, adolescentes e jovens..."
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Número de Participantes Previstos</label>
                    <input
                      type="text"
                      value={editProjParticipantsCount}
                      onChange={(e) => setEditProjParticipantsCount(e.target.value)}
                      placeholder="Ex: 200 crianças e jovens"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-bold mb-1">Municípios e Locais Específicos de Execução</label>
                    <input
                      type="text"
                      value={editProjExecutionLocations}
                      onChange={(e) => setEditProjExecutionLocations(e.target.value)}
                      placeholder="Ex: Petrópolis – RJ, Rio de Janeiro – RJ (Polos territoriais)"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Transparência e Financiamento Clássico */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">Execução Financeira Direta</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Fonte do Recurso</label>
                    <input
                      type="text"
                      value={editProjFundingSourceType}
                      onChange={(e) => setEditProjFundingSourceType(e.target.value)}
                      placeholder="Emenda Parlamentar, Edital, etc."
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Instrumento / Identificação</label>
                    <input
                      type="text"
                      value={editProjFundingInstrument}
                      onChange={(e) => setEditProjFundingInstrument(e.target.value)}
                      placeholder="EMENDA-2022-382"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Órgão Concedente</label>
                    <input
                      type="text"
                      value={editProjFundingOrgan}
                      onChange={(e) => setEditProjFundingOrgan(e.target.value)}
                      placeholder="Ministério da Educação, Governo do RJ"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Autor da Emenda</label>
                    <input
                      type="text"
                      value={editProjFundingAuthor}
                      onChange={(e) => setEditProjFundingAuthor(e.target.value)}
                      placeholder="Deputado Estadual..."
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Recurso Recebido (R$)</label>
                    <CurrencyInput
                      id="edit-proj-received-input"
                      value={editProjReceivedAmount}
                      onChange={setEditProjReceivedAmount}
                      placeholder="Ex: 150.000,00"
                      showQuickChips={false}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Despesas Comprovadas (R$)</label>
                    <CurrencyInput
                      id="edit-proj-proven-input"
                      value={editProjProvenExpenses}
                      onChange={setEditProjProvenExpenses}
                      placeholder="Ex: 150.000,00"
                      showQuickChips={false}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal para Copiar Credenciais */}
      {credentialsToCopy && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 text-indigo-900 mb-4">
                <div className="p-2.5 bg-indigo-50 rounded-full text-indigo-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">
                    {credentialsToCopy.actionType === 'creation' 
                      ? 'Conta Criada com Sucesso!' 
                      : credentialsToCopy.actionType === 'profile-change'
                      ? 'Sua Senha foi Alterada!'
                      : 'Senha Redefinida com Sucesso!'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {credentialsToCopy.actionType === 'creation'
                      ? 'Abaixo estão os dados de acesso para o novo usuário.'
                      : credentialsToCopy.actionType === 'profile-change'
                      ? 'As suas credenciais de segurança foram atualizadas.'
                      : 'A senha do usuário foi alterada com sucesso.'}
                  </p>
                </div>
              </div>

              {/* Box de Credenciais rápidas */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Nome:</span>
                  <span className="font-bold text-slate-800">{credentialsToCopy.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Usuário/Login:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-200/60 px-1.5 py-0.5 rounded">{credentialsToCopy.username}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Senha:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{credentialsToCopy.password}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(credentialsToCopy.password);
                        showNotification('Senha copiada para área de transferência!');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                      title="Copiar apenas a senha"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagem Completa Pré-formatada para Envio */}
              {credentialsToCopy.actionType === 'profile-change' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs leading-relaxed space-y-1.5">
                  <strong className="block text-emerald-950 font-bold">✓ Alerta de Segurança:</strong>
                  <p>Sua senha pessoal de login foi salva e sincronizada com segurança com o banco de dados da instituição (Firestore).</p>
                  <p>Não se esqueça de usar esta nova chave no seu próximo login ao acessar este painel.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500">Mensagem para enviar ao usuário (WhatsApp/E-mail):</label>
                  <textarea
                    readOnly
                    rows={6}
                    value={`Olá, ${credentialsToCopy.name}!
 
Sua conta de acesso ao Painel Administrativo do IFPP foi ${credentialsToCopy.actionType === 'creation' ? 'criada' : 'atualizada'} com sucesso.

Aqui estão suas credenciais de acesso:
🔗 Link do Painel: https://ifpp.com.br/admin
👤 Usuário/Login: ${credentialsToCopy.username}
🔑 Senha de Acesso: ${credentialsToCopy.password}

Guarde estas informações com segurança e não as compartilhe com ninguém.`}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCredentialsToCopy(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Fechar
              </button>
              {credentialsToCopy.actionType !== 'profile-change' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const msgText = `Olá, ${credentialsToCopy.name}!
 
Sua conta de acesso ao Painel Administrativo do IFPP foi ${credentialsToCopy.actionType === 'creation' ? 'criada' : 'atualizada'} com sucesso.

Aqui estão suas credenciais de acesso:
🔗 Link do Painel: https://ifpp.com.br/admin
👤 Usuário/Login: ${credentialsToCopy.username}
🔑 Senha de Acesso: ${credentialsToCopy.password}

Guarde estas informações com segurança e não as compartilhe com ninguém.`;
                      navigator.clipboard.writeText(msgText);
                      showNotification('Mensagem copiada para a área de transferência!');
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Mensagem
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Olá, ${credentialsToCopy.name}!
 
Sua conta de acesso ao Painel Administrativo do IFPP foi ${credentialsToCopy.actionType === 'creation' ? 'criada' : 'atualizada'} com sucesso.

Aqui estão suas credenciais de acesso:
🔗 Link do Painel: https://ifpp.com.br/admin
👤 Usuário/Login: ${credentialsToCopy.username}
🔑 Senha de Acesso: ${credentialsToCopy.password}

Guarde estas informações com segurança e não as compartilhe com ninguém.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      const msgText = `Olá, ${credentialsToCopy.name}!
 
Sua conta de acesso ao Painel Administrativo do IFPP foi ${credentialsToCopy.actionType === 'creation' ? 'criada' : 'atualizada'} com sucesso.

Aqui estão suas credenciais de acesso:
🔗 Link do Painel: https://ifpp.com.br/admin
👤 Usuário/Login: ${credentialsToCopy.username}
🔑 Senha de Acesso: ${credentialsToCopy.password}

Guarde estas informações com segurança e não as compartilhe com ninguém.`;
                      navigator.clipboard.writeText(msgText);
                      showNotification('Mensagem copiada! Abrindo WhatsApp...');
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Enviar p/ WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Redefinição de Senha */}
      {userToResetPassword && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <div className="p-2 bg-amber-50 rounded-full">
                  <Key className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">Redefinir Senha</h3>
                  <p className="text-xs text-slate-500">Alterando senha do usuário: <strong className="text-slate-700">{userToResetPassword.name}</strong></p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Nova Senha de Acesso *</label>
                    <button
                      type="button"
                      onClick={() => setTempResetPassword(generateRandomPassword())}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin-once" />
                      Gerar Nova Senha
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={tempResetPassword}
                      onChange={(e) => setTempResetPassword(e.target.value)}
                      className="w-full p-2.5 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setUserToResetPassword(null);
                  setTempResetPassword('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (tempResetPassword.length < 4) {
                    showNotification('A nova senha deve ter pelo menos 4 caracteres.');
                    return;
                  }
                  
                  const updatedUser = {
                    ...userToResetPassword,
                    password: tempResetPassword
                  };
                  
                  await onUpdateUser(updatedUser);
                  
                  setCredentialsToCopy({
                    name: updatedUser.name,
                    username: updatedUser.username,
                    password: updatedUser.password,
                    actionType: 'reset'
                  });
                  
                  setUserToResetPassword(null);
                  setTempResetPassword('');
                  showNotification('Senha alterada com sucesso!');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Salvar Nova Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Files & Photos Manager Modal */}
      {projectToManageFiles && (
        <ProjectFilesModal
          isOpen={!!projectToManageFiles}
          onClose={() => setProjectToManageFiles(null)}
          projects={projects}
          initialProjectId={projectToManageFiles.id}
          records={records}
          onAddRecord={(rec) => {
            addRecord(rec);
            showNotification('Arquivo ou Foto cadastrado com sucesso para o projeto!');
          }}
          onUpdateRecord={(rec) => {
            updateRecord(rec);
            showNotification('Arquivo ou Foto do projeto atualizado com sucesso!');
          }}
          onDeleteRecord={(recId) => {
            deleteRecord(recId);
            showNotification('Arquivo/Foto excluído com sucesso.');
          }}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogin={onLogin}
        />
      )}

      {/* Project Images Manager Modal (Adicionar, alterar e excluir imagens de cada projeto individual) */}
      {projectToManageImages && (
        <ProjectImagesModal
          isOpen={!!projectToManageImages}
          onClose={() => setProjectToManageImages(null)}
          project={projectToManageImages}
          onSaveProject={(updatedProj) => {
            updateProject(updatedProj);
            setProjectToManageImages(null);
            showNotification('Imagens do projeto atualizadas com sucesso!');
          }}
        />
      )}
    </div>
  );
}
