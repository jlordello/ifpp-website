import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeTab from './components/HomeTab';
import ProjectsTab from './components/ProjectsTab';
import TransparencyTab from './components/TransparencyTab';
import AdminPanel from './components/AdminPanel';

import { TransparencyRecord, Project, Emenda, AdminUser } from './types';
import { initialProjects, initialEmendas, initialRecords } from './data/initialData';
import { 
  syncCollection, 
  saveRecord, 
  removeRecord, 
  saveProject, 
  removeProject, 
  saveEmenda, 
  removeEmenda,
  initialUsers,
  saveUser,
  removeUser
} from './lib/firebase';

export default function App() {
  // 1. Tab Routing
  const [activeTab, setActiveTab] = useState<string>('home');

  // 2. Auth State
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('ifpp_logged_in_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Storage access not available in this context", e);
      return null;
    }
  });

  const isAdminLoggedIn = !!loggedInUser;

  // 3. Central Dynamic States synchronized with Firestore online
  const [records, setRecords] = useState<TransparencyRecord[]>(initialRecords);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [emendas, setEmendas] = useState<Emenda[]>(initialEmendas);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  // 4. Online Database Synchronization Effects
  useEffect(() => {
    // Sync records collection
    const unsubscribeRecords = syncCollection<TransparencyRecord>('records', setRecords, initialRecords);
    // Sync projects collection
    const unsubscribeProjects = syncCollection<Project>('projects', setProjects, initialProjects);
    // Sync emendas collection
    const unsubscribeEmendas = syncCollection<Emenda>('emendas', setEmendas, initialEmendas);
    // Sync users collection
    const unsubscribeUsers = syncCollection<AdminUser>('users', setUsers, initialUsers);

    return () => {
      unsubscribeRecords();
      unsubscribeProjects();
      unsubscribeEmendas();
      unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    try {
      if (loggedInUser) {
        localStorage.setItem('ifpp_logged_in_user', JSON.stringify(loggedInUser));
        localStorage.setItem('ifpp_admin_logged', 'true');
      } else {
        localStorage.removeItem('ifpp_logged_in_user');
        localStorage.setItem('ifpp_admin_logged', 'false');
      }
    } catch (e) {
      console.warn("Could not save admin log state to localStorage", e);
    }
  }, [loggedInUser]);

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
  const handleLogin = (username: string, password?: string): boolean => {
    const foundUser = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (foundUser) {
      setLoggedInUser(foundUser);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  // User Management Actions
  const handleAddUser = async (user: AdminUser) => {
    try {
      await saveUser(user);
    } catch (e) {
      console.error("Error saving user to Firestore", e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await removeUser(userId);
    } catch (e) {
      console.error("Error deleting user from Firestore", e);
    }
  };

  const handleUpdateUser = async (user: AdminUser) => {
    try {
      await saveUser(user);
      // If current user updated their own user/password, reflect changes
      if (loggedInUser && loggedInUser.id === user.id) {
        setLoggedInUser(user);
      }
    } catch (e) {
      console.error("Error updating user in Firestore", e);
    }
  };

  // 6. Record CRUD Actions
  const addRecord = async (newRecord: Omit<TransparencyRecord, 'id'>) => {
    const recordWithId: TransparencyRecord = {
      ...newRecord,
      id: `rec-${Date.now()}`,
      createdByUserName: loggedInUser?.name || 'Administrador Principal'
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
    const recordToSave: TransparencyRecord = {
      ...updatedRecord,
      updatedByUserName: loggedInUser?.name || 'Administrador Principal'
    };
    try {
      await saveRecord(recordToSave);
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
      id: `proj-${slug}-${Date.now()}`,
      createdByUserName: loggedInUser?.name || 'Administrador Principal'
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
      id: `emenda-${Date.now()}`,
      createdByUserName: loggedInUser?.name || 'Administrador Principal'
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
            loggedInUser={loggedInUser}
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
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
