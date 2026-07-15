import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, onSnapshot, setDoc, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { TransparencyRecord, Project, Emenda } from '../types';
import { initialProjects, initialEmendas, initialRecords } from '../data/initialData';

const firebaseConfig = {
  apiKey: "AIzaSyDIAnI6BW2aDVYVO2MRIE4oetnO2Y7FcLU",
  authDomain: "barbearia-genesis.firebaseapp.com",
  projectId: "barbearia-genesis",
  storageBucket: "barbearia-genesis.firebasestorage.app",
  messagingSenderId: "759365410229",
  appId: "1:759365410229:web:f4ffe3fa2486b2161d0dfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
const db = initializeFirestore(app, {}, "ai-studio-ifppinstitutodep-93f1bcb0-a477-4dab-9bcf-8e976363cebf");

// Firestore Collection References
export const recordsCol = collection(db, 'records');
export const projectsCol = collection(db, 'projects');
export const emendasCol = collection(db, 'emendas');

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
          batch.set(docRef, item);
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
  });
}

// Single item persistence helpers
export async function saveRecord(record: TransparencyRecord) {
  const docRef = doc(db, 'records', record.id);
  await setDoc(docRef, record);
}

export async function removeRecord(id: string) {
  const docRef = doc(db, 'records', id);
  await deleteDoc(docRef);
}

export async function saveProject(project: Project) {
  const docRef = doc(db, 'projects', project.id);
  await setDoc(docRef, project);
}

export async function removeProject(id: string) {
  const docRef = doc(db, 'projects', id);
  await deleteDoc(docRef);
}

export async function saveEmenda(emenda: Emenda) {
  const docRef = doc(db, 'emendas', emenda.id);
  await setDoc(docRef, emenda);
}

export async function removeEmenda(id: string) {
  const docRef = doc(db, 'emendas', id);
  await deleteDoc(docRef);
}
