import { MapPin, Mail, Phone, Calendar, Award, Lock, Instagram } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="bg-indigo-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 pb-12 border-b border-indigo-900/60">
          
          {/* Institutional Info Column */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="https://i.ibb.co/pj5GWs7Z/Chat-GPT-Image-11-de-jul-de-2026-18-53-48-removebg-preview.png" 
                alt="IFPP Logo" 
                className="h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Instituto de Formação e Promoção de Políticas Públicas. Atuando desde 2021 com cultura, esporte, educação, formação e cidadania em Petrópolis, Paraíba do Sul e Rio de Janeiro.
            </p>
            <div className="pt-2 text-xs text-slate-400 font-mono">
              CNPJ: <span className="text-slate-300 font-semibold">08.270.433/0001-79</span>
            </div>
          </div>

          {/* Quick Menu Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Navegação Rápida</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setActiveTab('home')} 
                  className="hover:text-white transition-colors text-slate-400 focus:outline-none cursor-pointer"
                >
                  Início / Quem Somos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('projects')} 
                  className="hover:text-white transition-colors text-slate-400 focus:outline-none cursor-pointer"
                >
                  Projetos Culturais & Cursos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('transparency')} 
                  className="hover:text-white transition-colors text-slate-400 focus:outline-none cursor-pointer"
                >
                  Transparência e Contas
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Contatos & Localização</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm leading-relaxed">
                  Av. Franklin Roosevelt, 194 - Centro<br />
                  Rio de Janeiro - RJ, CEP 20021-120
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                <a href="mailto:comunicacao.ifpp@gmail.com" className="hover:text-white transition-colors text-slate-300 font-mono">
                  comunicacao.ifpp@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                <a href="tel:+5521996569997" className="hover:text-white transition-colors text-slate-300 font-mono">
                  (21) 99656-9997
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-indigo-400 shrink-0" />
                <a 
                  href="https://www.instagram.com/instituto.ifpp/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors text-slate-300 font-mono"
                >
                  @instituto.ifpp
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {currentYear} IFPP - Instituto de Formação e Promoção de Políticas Públicas. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('admin')}
              className="text-slate-600 hover:text-indigo-400 transition-colors p-1 rounded hover:bg-indigo-900/40 focus:outline-none cursor-pointer"
              title="Área Administrativa"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
