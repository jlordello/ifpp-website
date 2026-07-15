import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeTab from './components/HomeTab';
import ProjectsTab from './components/ProjectsTab';
import TransparencyTab from './components/TransparencyTab';
import AdminPanel from './components/AdminPanel';

import { TransparencyRecord, Project, Emenda } from './types';
import { initialProjects, initialEmendas, initialRecords } from './data/initialData';
import { 
  syncCollection, 
  saveRecord, 
  removeRecord, 
  saveProject, 
  removeProject, 
  saveEmenda, 
  removeEmenda 
} from './lib/firebase';

export default function App() {
  // 1. Tab Routing
  const [activeTab, setActiveTab] = useState<string>('home');

  // 2. Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ifpp_admin_logged');
      return saved === 'true';
    } catch (e) {
      console.warn("Storage access not available in this context", e);
      return false;
    }
  });

  // 3. Central Dynamic States synchronized with Firestore online
  const [records, setRecords] = useState<TransparencyRecord[]>(initialRecords);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [emendas, setEmendas] = useState<Emenda[]>(initialEmendas);

  // 4. Online Database Synchronization Effects
  useEffect(() => {
    // Sync records collection
    const unsubscribeRecords = syncCollection<TransparencyRecord>('records', setRecords, initialRecords);
    // Sync projects collection
    const unsubscribeProjects = syncCollection<Project>('projects', setProjects, initialProjects);
    // Sync emendas collection
    const unsubscribeEmendas = syncCollection<Emenda>('emendas', setEmendas, initialEmendas);

    return () => {
      unsubscribeRecords();
      unsubscribeProjects();
      unsubscribeEmendas();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ifpp_admin_logged', isAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.warn("Could not save admin log state to localStorage", e);
    }
  }, [isAdminLoggedIn]);

  // 4.5. Router / Path Navigation Effect
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setActiveTab('admin');
      } else if (path === '/projects' || hash === '#/projects' || hash === '#projects') {
        setActiveTab('projects');
      } else if (path === '/transparency' || hash === '#/transparency' || hash === '#transparency') {
        setActiveTab('transparency');
      } else {
        setActiveTab('home');
      }
    };

    // Run on mount
    handleRoute();

    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);

    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (activeTab === 'admin') {
      if (currentPath !== '/admin') {
        try {
          window.history.pushState({}, '', '/admin');
        } catch (e) {
          console.warn("Could not pushState in sandboxed iframe environment", e);
        }
      }
    } else {
      const expectedPath = activeTab === 'home' ? '/' : `/${activeTab}`;
      if (currentPath !== expectedPath && currentPath === '/admin') {
        try {
          window.history.pushState({}, '', expectedPath);
        } catch (e) {
          console.warn("Could not pushState in sandboxed iframe environment", e);
        }
      }
    }
  }, [activeTab]);

  // Scroll to top of window whenever the active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab]);

  // 5. Auth Actions
  const handleLogin = (password: string): boolean => {
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
  };

  // 6. Record CRUD Actions
  const addRecord = async (newRecord: Omit<TransparencyRecord, 'id'>) => {
    const recordWithId: TransparencyRecord = {
      ...newRecord,
      id: `rec-${Date.now()}`
    };
    try {
      await saveRecord(recordWithId);
    } catch (e) {
      console.error("Error saving record to Firestore", e);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await removeRecord(id);
    } catch (e) {
      console.error("Error deleting record from Firestore", e);
    }
  };

  const updateRecord = async (updatedRecord: TransparencyRecord) => {
    try {
      await saveRecord(updatedRecord);
    } catch (e) {
      console.error("Error updating record in Firestore", e);
    }
  };

  // 7. Project CRUD Actions
  const addProject = async (newProject: Omit<Project, 'id'>) => {
    const slug = newProject.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const projWithId: Project = {
      ...newProject,
      id: `proj-${slug}-${Date.now()}`
    };

    try {
      await saveProject(projWithId);

      // If an emenda is linked to this project, automatically update the emenda's allocatedProjectId
      if (newProject.emendaId) {
        const em = emendas.find(e => e.id === newProject.emendaId);
        if (em) {
          await saveEmenda({ ...em, allocatedProjectId: projWithId.id });
        }
      }
    } catch (e) {
      console.error("Error creating project in Firestore", e);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await removeProject(id);
      
      // Remove references in emendas
      for (const em of emendas) {
        if (em.allocatedProjectId === id) {
          await saveEmenda({ ...em, allocatedProjectId: undefined });
        }
      }
      // Remove references in records
      for (const rec of records) {
        if (rec.projectLinked === id) {
          await saveRecord({ ...rec, projectLinked: undefined });
        }
      }
    } catch (e) {
      console.error("Error deleting project in Firestore", e);
    }
  };

  // 8. Emenda CRUD Actions
  const addEmenda = async (newEmenda: Omit<Emenda, 'id'>) => {
    const emendaWithId: Emenda = {
      ...newEmenda,
      id: `emenda-${Date.now()}`
    };

    try {
      await saveEmenda(emendaWithId);

      // If a project is linked, update that project's emendaId
      if (newEmenda.allocatedProjectId) {
        const p = projects.find(proj => proj.id === newEmenda.allocatedProjectId);
        if (p) {
          await saveProject({ ...p, emendaId: emendaWithId.id });
        }
      }
    } catch (e) {
      console.error("Error creating emenda in Firestore", e);
    }
  };

  const deleteEmenda = async (id: string) => {
    try {
      await removeEmenda(id);

      // Remove references in projects
      for (const p of projects) {
        if (p.emendaId === id) {
          await saveProject({ ...p, emendaId: undefined });
        }
      }
      // Remove references in records
      for (const rec of records) {
        if (rec.fundingSource === id) {
          await saveRecord({ ...rec, fundingSource: undefined });
        }
      }
    } catch (e) {
      console.error("Error deleting emenda in Firestore", e);
    }
  };

  // 9. Tab Renderer Switch
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onNavigate={(tab) => setActiveTab(tab)} />;
      case 'projects':
        return (
          <ProjectsTab 
            projects={projects} 
            emendas={emendas} 
            onNavigateToTransparency={() => setActiveTab('transparency')} 
          />
        );
      case 'transparency':
        return (
          <TransparencyTab 
            records={records} 
            projects={projects} 
            emendas={emendas} 
          />
        );
      case 'admin':
        return (
          <AdminPanel
            isAdminLoggedIn={isAdminLoggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
            records={records}
            addRecord={addRecord}
            deleteRecord={deleteRecord}
            updateRecord={updateRecord}
            projects={projects}
            addProject={addProject}
            deleteProject={deleteProject}
            emendas={emendas}
            addEmenda={addEmenda}
            deleteEmenda={deleteEmenda}
          />
        );
      default:
        return <HomeTab onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* 1. Header/Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
      />

      {/* 2. Main Render Stage */}
      <main className="flex-grow">
        {renderTabContent()}
      </main>

      {/* 3. Footer with contact and address info */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
