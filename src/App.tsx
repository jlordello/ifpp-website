import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeTab from './components/HomeTab';
import ProjectsTab from './components/ProjectsTab';
import TransparencyTab from './components/TransparencyTab';
import AdminPanel from './components/AdminPanel';

import { TransparencyRecord, Project, Emenda } from './types';
import { initialProjects, initialEmendas, initialRecords } from './data/initialData';

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

  // 3. Central Dynamic States loaded lazily from localStorage or seeds
  const [records, setRecords] = useState<TransparencyRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ifpp_records_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing records from localStorage", e);
    }
    return initialRecords;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('ifpp_projects_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing projects from localStorage", e);
    }
    return initialProjects;
  });

  const [emendas, setEmendas] = useState<Emenda[]>(() => {
    try {
      const saved = localStorage.getItem('ifpp_emendas_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing emendas from localStorage", e);
    }
    return initialEmendas;
  });

  // 4. Persistence Effect hooks
  useEffect(() => {
    try {
      localStorage.setItem('ifpp_records_v1', JSON.stringify(records));
    } catch (e) {
      console.warn("Could not save records to localStorage", e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('ifpp_projects_v1', JSON.stringify(projects));
    } catch (e) {
      console.warn("Could not save projects to localStorage", e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('ifpp_emendas_v1', JSON.stringify(emendas));
    } catch (e) {
      console.warn("Could not save emendas to localStorage", e);
    }
  }, [emendas]);

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
  const addRecord = (newRecord: Omit<TransparencyRecord, 'id'>) => {
    const recordWithId: TransparencyRecord = {
      ...newRecord,
      id: `rec-${Date.now()}`
    };
    setRecords(prev => [recordWithId, ...prev]);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateRecord = (updatedRecord: TransparencyRecord) => {
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  // 7. Project CRUD Actions
  const addProject = (newProject: Omit<Project, 'id'>) => {
    // Generate simple slug id
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
    setProjects(prev => [...prev, projWithId]);

    // If an emenda is linked to this project, automatically update the emenda's allocatedProjectId
    if (newProject.emendaId) {
      setEmendas(prevEmendas => 
        prevEmendas.map(em => 
          em.id === newProject.emendaId 
            ? { ...em, allocatedProjectId: projWithId.id }
            : em
        )
      );
    }
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Remove references in emendas
    setEmendas(prev => prev.map(em => em.allocatedProjectId === id ? { ...em, allocatedProjectId: undefined } : em));
    // Remove references in records
    setRecords(prev => prev.map(rec => rec.projectLinked === id ? { ...rec, projectLinked: undefined } : rec));
  };

  // 8. Emenda CRUD Actions
  const addEmenda = (newEmenda: Omit<Emenda, 'id'>) => {
    const emendaWithId: Emenda = {
      ...newEmenda,
      id: `emenda-${Date.now()}`
    };
    setEmendas(prev => [...prev, emendaWithId]);

    // If a project is linked, update that project's emendaId
    if (newEmenda.allocatedProjectId) {
      setProjects(prevProj => 
        prevProj.map(p => 
          p.id === newEmenda.allocatedProjectId 
            ? { ...p, emendaId: emendaWithId.id }
            : p
        )
      );
    }
  };

  const deleteEmenda = (id: string) => {
    setEmendas(prev => prev.filter(e => e.id !== id));
    // Remove references in projects
    setProjects(prev => prev.map(p => p.emendaId === id ? { ...p, emendaId: undefined } : p));
    // Remove references in records
    setRecords(prev => prev.map(rec => rec.fundingSource === id ? { ...rec, fundingSource: undefined } : rec));
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
