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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username === 'admin' && parsed.password !== '241910') {
          parsed.password = '241910';
        }
        return parsed;
      }
      return null;
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

  // Project-specific Transparency navigation State
  const [selectedTransparencyProjectId, setSelectedTransparencyProjectId] = useState<string | null>(null);

  // 4. Online Database Synchronization Effects
  useEffect(() => {
    // Sync records collection
    const unsubscribeRecords = syncCollection<TransparencyRecord>('records', setRecords, initialRecords);
    // Sync projects collection
    const obsoleteDemoIds = ['hip-hop-funk-2023', 'capacitacao-politicas-2024'];
    const unsubscribeProjects = syncCollection<Project>('projects', (dbProjects) => {
      // Filter out obsolete demo projects and guarantee the official real projects are present
      const cleaned = dbProjects.filter(p => !obsoleteDemoIds.includes(p.id));
      const merged = [...cleaned];
      initialProjects.forEach(initP => {
        const existingIdx = merged.findIndex(p => p.id === initP.id);
        if (existingIdx === -1) {
          merged.push(initP);
        } else {
          // Keep rich data from initialProjects if Firestore has partial old version
          merged[existingIdx] = {
            ...initP,
            ...merged[existingIdx]
          };
        }
      });
      setProjects(merged);
    }, initialProjects);
    // Sync emendas collection
    const unsubscribeEmendas = syncCollection<Emenda>('emendas', (dbEmendas) => {
      const merged = [...dbEmendas];
      initialEmendas.forEach(initE => {
        const existingIdx = merged.findIndex(e => e.id === initE.id);
        if (existingIdx === -1) {
          merged.push(initE);
        } else {
          merged[existingIdx] = {
            ...initE,
            ...merged[existingIdx]
          };
        }
      });
      setEmendas(merged);
    }, initialEmendas);
    // Sync users collection
    const unsubscribeUsers = syncCollection<AdminUser>('users', async (updatedUsers) => {
      const adminInDb = updatedUsers.find(u => u.username.toLowerCase() === 'admin');
      if (adminInDb && adminInDb.password !== '241910') {
        try {
          await saveUser({ ...adminInDb, password: '241910' });
        } catch (e) {
          console.error("Error auto-updating admin password in Firestore:", e);
        }
        setUsers(updatedUsers.map(u => u.username.toLowerCase() === 'admin' ? { ...u, password: '241910' } : u));
        return;
      }
      setUsers(updatedUsers);
    }, initialUsers);

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
      } else if (
        path === '/projects' || hash === '#/projects' || hash === '#projects' ||
        path.startsWith('/projetos') || hash.startsWith('#/projetos')
      ) {
        setActiveTab('projects');
        if (hash.startsWith('#/projetos/')) {
          const pId = hash.replace('#/projetos/', '').trim();
          setSelectedTransparencyProjectId(pId || null);
        }
      } else if (
        path === '/transparency' || hash === '#/transparency' || hash === '#transparency' ||
        path === '/transparencia' || hash === '#/transparencia'
      ) {
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
    const trimmedUser = username.trim().toLowerCase();
    const foundUser = users.find(
      u => u.username.toLowerCase() === trimmedUser && u.password === password
    );
    if (foundUser) {
      setLoggedInUser(foundUser);
      return true;
    }

    // Special guarantee for admin with password 241910
    if (trimmedUser === 'admin' && password === '241910') {
      const existingAdmin = users.find(u => u.username.toLowerCase() === 'admin') || {
        id: 'user-admin',
        username: 'admin',
        name: 'Administrador Principal',
        password: '241910',
        role: 'admin' as const
      };
      const updatedAdmin: AdminUser = {
        ...existingAdmin,
        password: '241910'
      };
      setLoggedInUser(updatedAdmin);
      saveUser(updatedAdmin).catch(e => console.error("Error saving updated admin credentials:", e));
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

  const updateProject = async (updatedProject: Project) => {
    const projectToSave: Project = {
      ...updatedProject,
      updatedByUserName: loggedInUser?.name || 'Administrador Principal'
    };
    try {
      await saveProject(projectToSave);

      // If an emenda is linked, synchronize emenda.allocatedProjectId
      if (projectToSave.emendaId) {
        const em = emendas.find(e => e.id === projectToSave.emendaId);
        if (em && em.allocatedProjectId !== projectToSave.id) {
          await saveEmenda({ ...em, allocatedProjectId: projectToSave.id });
        }
      }
      // If previous emenda was unlinked, clear allocatedProjectId from old emenda
      const previousProject = projects.find(p => p.id === projectToSave.id);
      if (previousProject?.emendaId && previousProject.emendaId !== projectToSave.emendaId) {
        const oldEm = emendas.find(e => e.id === previousProject.emendaId);
        if (oldEm && oldEm.allocatedProjectId === projectToSave.id) {
          await saveEmenda({ ...oldEm, allocatedProjectId: undefined });
        }
      }
    } catch (e) {
      console.error("Error updating project in Firestore", e);
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

  const updateEmenda = async (updatedEmenda: Emenda) => {
    const emendaToSave: Emenda = {
      ...updatedEmenda,
      updatedByUserName: loggedInUser?.name || 'Administrador Principal'
    };
    try {
      await saveEmenda(emendaToSave);

      // If project is linked, update that project's emendaId
      if (emendaToSave.allocatedProjectId) {
        const p = projects.find(proj => proj.id === emendaToSave.allocatedProjectId);
        if (p && p.emendaId !== emendaToSave.id) {
          await saveProject({ ...p, emendaId: emendaToSave.id });
        }
      }
      // If previous project was unlinked, clear emendaId from old project
      const previousEmenda = emendas.find(e => e.id === emendaToSave.id);
      if (previousEmenda?.allocatedProjectId && previousEmenda.allocatedProjectId !== emendaToSave.allocatedProjectId) {
        const oldProj = projects.find(p => p.id === previousEmenda.allocatedProjectId);
        if (oldProj && oldProj.emendaId === emendaToSave.id) {
          await saveProject({ ...oldProj, emendaId: undefined });
        }
      }
    } catch (e) {
      console.error("Error updating emenda in Firestore", e);
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
            records={records}
            initialSelectedProjectId={selectedTransparencyProjectId}
            onSelectProject={(id) => setSelectedTransparencyProjectId(id)}
            onNavigateToTransparency={() => {
              setActiveTab('transparency');
            }}
          />
        );
      case 'transparency':
        return (
          <TransparencyTab 
            records={records} 
            projects={projects} 
            emendas={emendas} 
            selectedProjectId={selectedTransparencyProjectId}
            onSelectProject={(id) => setSelectedTransparencyProjectId(id)}
            onNavigateToProject={(id) => {
              setSelectedTransparencyProjectId(id || null);
              setActiveTab('projects');
              if (id) {
                window.location.hash = `#/projetos/${id}`;
              } else {
                window.location.hash = '#/projetos';
              }
            }}
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
            updateProject={updateProject}
            emendas={emendas}
            addEmenda={addEmenda}
            deleteEmenda={deleteEmenda}
            updateEmenda={updateEmenda}
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
