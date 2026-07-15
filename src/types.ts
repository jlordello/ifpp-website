export type RecordType = 'conta' | 'ata' | 'estatuto';

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
  projectLinked?: string; // ID of the Project/Event/Course
  fundingSource?: string; // ID of the Emenda Parlamentar
  amount?: number; // Value in BRL
  category?: 'receita' | 'despesa';
  createdByUserName?: string;
  updatedByUserName?: string;
}

export type ProjectType = 'projeto' | 'curso' | 'evento';

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  year: number;
  description: string;
  status: 'em_andamento' | 'concluido' | 'planejado';
  impact?: string; // e.g. "1200 jovens"
  location?: string; // e.g. "Rio de Janeiro - Centro, Periferias"
  budget?: number;
  emendaId?: string; // linked emenda
  createdByUserName?: string;
  updatedByUserName?: string;
}

export interface Emenda {
  id: string;
  code: string; // e.g. "EMENDA-2023-082"
  author: string; // Politician or Government entity
  amount: number;
  year: number;
  description: string;
  allocatedProjectId?: string; // linked project
  createdByUserName?: string;
  updatedByUserName?: string;
}

