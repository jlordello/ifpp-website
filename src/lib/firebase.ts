import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, setDoc, doc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { TransparencyRecord, Project, Emenda, AdminUser } from '../types';
import { initialProjects, initialEmendas, initialRecords } from '../data/initialData';

const firebaseConfig = {
  apiKey: "AIzaSyDIAnI6BW2aDVYVO2MRIE4oetnO2Y7FcLU",
  authDomain: "barbearia-genesis.firebaseapp.com",
  projectId: "barbearia-genesis",
  storageBucket: "barbearia-genesis.firebasestorage.app",
  messagingSenderId: "759365410229",
  appId: "1:759365410229:web:f4ffe3fa2486b2161d0dfc"
};

export const initialUsers: AdminUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    name: 'Administrador Principal',
    password: 'admin123',
    role: 'admin'
  }
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-ifppinstitutodep-93f1bcb0-a477-4dab-9bcf-8e976363cebf");

// Firestore Collection References
export const recordsCol = collection(db, 'records');
export const projectsCol = collection(db, 'projects');
export const emendasCol = collection(db, 'emendas');
export const usersCol = collection(db, 'users');

// Operation enum and error handling from the firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to remove any undefined properties from an object so Firestore doesn't reject them
export function cleanData<T extends object>(obj: T): T {
  const cleaned = { ...obj } as any;
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

// Real-time synchronization helper
export function syncCollection<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  initialSeeds: T[]
) {
  const colRef = collection(db, collectionName);
  
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // If the online database is completely empty for this collection, seed it
      console.log(`Collection ${collectionName} is empty. Seeding initial data...`);
      try {
        const batch = writeBatch(db);
        initialSeeds.forEach((item: any) => {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, cleanData(item));
        });
        await batch.commit();
      } catch (error) {
        console.error(`Error seeding ${collectionName}:`, error);
      }
    } else {
      const data: T[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as T);
      });
      onUpdate(data);
    }
  }, (error) => {
    console.error(`Error syncing ${collectionName}:`, error);
    try {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    } catch (e) {
      // Keep running sync listener errors from crashing entirely, but ensure they are logged
    }
  });
}

// Single item persistence helpers
export async function saveRecord(record: TransparencyRecord) {
  const path = `records/${record.id}`;
  try {
    let finalRecord = { ...record };
    
    // Check if we need to chunk the file
    if (record.fileUrl && record.fileUrl.startsWith('data:')) {
      const isCompressed = record.fileUrl.includes(';base64,GZIP:');
      
      // Extract the actual base64 data to check if it needs chunking
      const commaIndex = record.fileUrl.indexOf(',');
      const mimeType = record.fileUrl.substring(5, record.fileUrl.indexOf(';'));
      let base64Data = record.fileUrl.substring(commaIndex + 1);
      if (isCompressed && base64Data.startsWith('GZIP:')) {
        base64Data = base64Data.substring(5);
      }
      
      // If base64 content is larger than 150,000 characters (~110KB), chunk it.
      // Keeping chunks small (~150KB) ensures perfect Firestore reliability.
      if (base64Data.length > 150000) {
        const chunkSize = 150000;
        const chunkCount = Math.ceil(base64Data.length / chunkSize);
        
        const batch = writeBatch(db);
        for (let i = 0; i < chunkCount; i++) {
          const start = i * chunkSize;
          const chunkData = base64Data.substring(start, start + chunkSize);
          const chunkDocRef = doc(db, 'file_chunks', `${record.id}_chunk_${i}`);
          batch.set(chunkDocRef, {
            recordId: record.id,
            index: i,
            data: chunkData
          });
        }
        
        // Delete any obsolete higher index chunks
        for (let i = chunkCount; i < 40; i++) {
          const chunkDocRef = doc(db, 'file_chunks', `${record.id}_chunk_${i}`);
          batch.delete(chunkDocRef);
        }
        
        await batch.commit();
        
        // Update the main record's fileUrl to the chunked reference
        finalRecord.fileUrl = `chunked|${mimeType}|${chunkCount}|${isCompressed ? 'GZIP' : 'RAW'}`;
      } else {
        // If it fits in a single small doc, delete any old chunks
        const batch = writeBatch(db);
        for (let i = 0; i < 40; i++) {
          const chunkDocRef = doc(db, 'file_chunks', `${record.id}_chunk_${i}`);
          batch.delete(chunkDocRef);
        }
        await batch.commit();
      }
    }
    
    const docRef = doc(db, 'records', record.id);
    await setDoc(docRef, cleanData(finalRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function reconstructFileUrl(fileUrl: string, recordId: string): Promise<string> {
  if (!fileUrl || !fileUrl.startsWith('chunked|')) {
    return fileUrl;
  }
  
  try {
    const parts = fileUrl.split('|');
    const mimeType = parts[1];
    const chunkCount = parseInt(parts[2], 10);
    const mode = parts[3]; // 'GZIP' or 'RAW'
    
    const chunks: string[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunkDocRef = doc(db, 'file_chunks', `${recordId}_chunk_${i}`);
      const chunkSnap = await getDoc(chunkDocRef);
      if (chunkSnap.exists()) {
        chunks.push(chunkSnap.data().data);
      } else {
        throw new Error(`Parte ${i} do arquivo não encontrada.`);
      }
    }
    
    const base64Data = chunks.join('');
    if (mode === 'GZIP') {
      return `data:${mimeType};base64,GZIP:${base64Data}`;
    } else {
      return `data:${mimeType};base64,${base64Data}`;
    }
  } catch (error) {
    console.error("Erro ao reconstruir arquivo:", error);
    throw error;
  }
}

export async function removeRecord(id: string) {
  const path = `records/${id}`;
  try {
    // Delete any chunks (up to 40 chunks = ~6MB)
    const batch = writeBatch(db);
    for (let i = 0; i < 40; i++) {
      const chunkDocRef = doc(db, 'file_chunks', `${id}_chunk_${i}`);
      batch.delete(chunkDocRef);
    }
    const docRef = doc(db, 'records', id);
    batch.delete(docRef);
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveProject(project: Project) {
  const path = `projects/${project.id}`;
  try {
    const docRef = doc(db, 'projects', project.id);
    await setDoc(docRef, cleanData(project));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeProject(id: string) {
  const path = `projects/${id}`;
  try {
    const docRef = doc(db, 'projects', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveEmenda(emenda: Emenda) {
  const path = `emendas/${emenda.id}`;
  try {
    const docRef = doc(db, 'emendas', emenda.id);
    await setDoc(docRef, cleanData(emenda));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeEmenda(id: string) {
  const path = `emendas/${id}`;
  try {
    const docRef = doc(db, 'emendas', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveUser(user: AdminUser) {
  const path = `users/${user.id}`;
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, cleanData(user));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeUser(id: string) {
  const path = `users/${id}`;
  try {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

