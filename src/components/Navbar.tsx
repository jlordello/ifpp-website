import { useState } from 'react';
import { Menu, X, Landmark, FileText, Settings, ShieldCheck, PhoneCall, Instagram } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export default function Navbar({ activeTab, setActiveTab, isAdminLoggedIn, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início', icon: Landmark },
    { id: 'projects', label: 'Projetos & Cursos', icon: FileText },
    { id: 'transparency', label: 'Transparência', icon: ShieldCheck },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center group text-left focus:outline-none py-1.5"
            >
              <img 
                src="https://i.ibb.co/Kzzbrxw5/Chat-GPT-Image-11-de-jul-de-2026-19-03-41-removebg-preview.png" 
                alt="IFPP Logo" 
                className="h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-900 border border-indigo-100/30'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-950'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-indigo-900' : 'text-slate-400'}`} />
                  {item.label}
                  {item.id === 'admin' && isAdminLoggedIn && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
                  )}
                </button>
              );
            })}

            <a
              href="https://www.instagram.com/instituto.ifpp/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-950 transition-all duration-150 cursor-pointer"
              title="Siga o IFPP no Instagram"
            >
              <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
              <span className="hidden lg:inline">Instagram</span>
            </a>

            {isAdminLoggedIn && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-md transition-colors cursor-pointer"
                >
                  Sair Admin
                </button>
              </div>
            )}
          </div>

          {/* Hamburger button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-indigo-900 hover:bg-slate-100 focus:outline-none transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-inner">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-indigo-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'admin' && isAdminLoggedIn && (
                  <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full ml-auto font-normal">
                    Conectado
                  </span>
                )}
              </button>
            );
          })}

          <a
            href="https://www.instagram.com/instituto.ifpp/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <Instagram className="w-5 h-5 text-pink-600 shrink-0" />
            <span>Instagram</span>
          </a>

          {isAdminLoggedIn && (
            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                Sair do Modo Administrativo
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
