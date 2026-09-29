export type RecordType = 'conta' | 'ata' | 'estatuto';

export type RecordDocCategory = 
  | 'prestacao_contas' 
  | 'relatorios' 
  | 'notas_fiscais' 
  | 'termos_parceria' 
  | 'outros';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface TransparencyRecord {
  id: string;
  type: RecordType;
  title: string;
  year: number;
  description: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'document' | 'photo';
  projectLinked?: string; // ID of the Project/Event/Course
  fundingSource?: string; // ID of the Emenda Parlamentar / Fonte
  amount?: number; // Value in BRL
  category?: 'receita' | 'despesa';
  docCategory?: RecordDocCategory; // Categorização específica para prestação de contas do projeto
  createdByUserName?: string;
  updatedByUserName?: string;
}

export type ProjectType = 'projeto' | 'curso' | 'evento';

export type ProjectStatus = 'em_andamento' | 'concluido' | 'aprovado' | 'planejado';

export interface ProjectIndicator {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  category?: string; // e.g. "Formação / Juventude", "Cultura / Juventude", "Educação"
  year?: number;
  description: string; // Resumo curto de 3 a 4 linhas para os cards
  fullDescription?: string; // Descrição completa para a página individual
  status: ProjectStatus;
  tags?: string[];
  mainImage?: string;
  gallery?: string[];
  indicators?: ProjectIndicator[];
  territories?: string[];
  impact?: string; // e.g. "+1.290 participantes"
  location?: string; // e.g. "Niterói, São Gonçalo e Rio de Janeiro"
  
  // Transparência e informações financeiras específicas do projeto
  budget?: number;
  emendaId?: string; // linked emenda id (quando houver)
  fundingSourceType?: string; // e.g. "Emenda Parlamentar", "Recurso Próprio", "Edital", "Convênio", "Termo de Parceria"
  fundingInstrument?: string; // identificação/número da emenda, termo ou convênio
  fundingOrgan?: string; // órgão responsável pelo repasse
  fundingAuthor?: string; // autor da emenda (quando for emenda parlamentar)
  receivedAmount?: number; // Recurso recebido
  provenExpenses?: number; // Despesas comprovadas
  balance?: number; // Saldo
  financialStatusNote?: string; // Nota/disclaimer quando não houver informação financeira ainda

  // Campos específicos Transferegov e formalização de propostas/projetos
  proposalNumber?: string; // Número da proposta Transferegov (ex: 010962/2026)
  proponentName?: string; // Proponente (IFPP)
  proponentCnpj?: string; // CNPJ (08.270.433/0001-79)
  grantingOrgan?: string; // Órgão Concedente
  programName?: string; // Programa
  officialObject?: string; // Objeto oficial da proposta
  globalValue?: number; // Valor global
  transferValue?: number; // Valor de repasse
  counterpartValue?: number; // Contrapartida
  emendaNumber?: string; // Número da emenda
  authorIndication?: string; // Autor / indicação parlamentar
  processNumber?: string; // Número do processo
  instrumentNumber?: string; // Número do instrumento
  goalsAndObjectives?: string; // Objetivos e metas
  targetAudience?: string; // Público beneficiário
  participantsCount?: string; // Número de participantes
  executionLocations?: string; // Municípios e locais de execução

  createdByUserName?: string;
  updatedByUserName?: string;
}

export interface Emenda {
  id: string;
  code: string; // e.g. "EMENDA-2022-382"
  author: string; // Politician or Government entity
  amount: number;
  year: number;
  description: string;
  allocatedProjectId?: string; // linked project
  organ?: string; // órgão concedente
  createdByUserName?: string;
  updatedByUserName?: string;
}

