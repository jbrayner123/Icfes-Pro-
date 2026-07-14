import { ModuleInfo, User } from "../types";
import { 
  MessageSquare, 
  Calculator, 
  BookOpen, 
  ShieldCheck, 
  Languages, 
  GitBranch, 
  FlaskConical, 
  Terminal,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Award,
  RotateCcw,
  Shield,
  LayoutDashboard,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  currentModuleId: string;
  onSelectModule: (moduleId: string) => void;
  cumulativeScore: number;
  totalQuestionsCount: number;
  completedCount: number;
  onGlobalReset: () => void;
  currentUser: User | null;
  onLogout: () => void;
  showAdminDashboard: boolean;
  onToggleAdminDashboard: (val: boolean) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const MODULES: ModuleInfo[] = [
  { id: "communication", name: "Comunicación Escrita", icon: "Communication" },
  { id: "quantitative-reasoning", name: "Razonamiento Cuantitativo", icon: "Quantitative Reasoning" },
  { id: "critical-reading", name: "Lectura Crítica", icon: "Critical Reading" },
  { id: "citizen-competencies", name: "Competencias Ciudadanas", icon: "Citizen Competencies" },
  { id: "english", name: "Inglés", icon: "English" },
  { id: "project-formulation", name: "Formulación de Proyectos", icon: "Project Formulation" },
  { id: "scientific-thinking", name: "Pensamiento Científico", icon: "Scientific Thinking" },
  { id: "software-design", name: "Diseño de Software", icon: "Software Design" },
];

const GENERICS = ["communication", "quantitative-reasoning", "critical-reading", "citizen-competencies", "english"];
const PROFESSIONALS = ["project-formulation", "scientific-thinking", "software-design"];

export default function Sidebar({ 
  currentModuleId, 
  onSelectModule, 
  cumulativeScore, 
  totalQuestionsCount,
  completedCount,
  onGlobalReset,
  currentUser,
  onLogout,
  showAdminDashboard,
  onToggleAdminDashboard,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Communication": return <MessageSquare className="w-5 h-5" />;
      case "Quantitative Reasoning": return <Calculator className="w-5 h-5" />;
      case "Critical Reading": return <BookOpen className="w-5 h-5" />;
      case "Citizen Competencies": return <ShieldCheck className="w-5 h-5" />;
      case "English": return <Languages className="w-5 h-5" />;
      case "Project Formulation": return <GitBranch className="w-5 h-5" />;
      case "Scientific Thinking": return <FlaskConical className="w-5 h-5" />;
      case "Software Design": return <Terminal className="w-5 h-5" />;
      default: return <Terminal className="w-5 h-5" />;
    }
  };

  const genericModules = MODULES.filter(m => GENERICS.includes(m.id));
  const professionalModules = MODULES.filter(m => PROFESSIONALS.includes(m.id));

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="lg:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-brand-bg border-b border-brand-ink/10">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-accent" />
          <span className="font-display text-base font-bold text-brand-ink uppercase tracking-wider">Pro Icfes</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-brand-ink text-brand-bg px-3 py-1 font-display font-bold uppercase tracking-wider">
            Score: {cumulativeScore}
          </span>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-brand-ink hover:bg-brand-ink/5 p-2 transition-colors focus:outline-none border border-transparent hover:border-brand-ink"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-brand-ink/40 z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-screen z-40 bg-brand-bg text-brand-ink border-r border-brand-ink/10
        flex flex-col justify-between transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20 p-4" : "w-64 p-6"}
        lg:translate-x-0 ${isOpen ? "translate-x-0 pt-20" : "-translate-x-full lg:pt-6"}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo / Header for Desktop */}
          <div className="hidden lg:block mb-8 shrink-0">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-1">
                <Award className="w-8 h-8 text-brand-accent animate-pulse" />
                <span className="font-mono text-[8px] uppercase tracking-widest text-brand-ink/40">PI</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-6 h-6 text-brand-accent" />
                  <h1 className="font-display text-xl font-bold uppercase tracking-tight text-brand-ink">Pro Icfes</h1>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-brand-ink/60">System Simulation v2.0</p>
              </>
            )}
          </div>

          {/* Logged in User Tag card */}
          {currentUser && (
            <div className={`mb-6 p-3 bg-white border border-brand-ink/10 rounded-none shrink-0 flex items-center gap-3
              ${isCollapsed ? "justify-center p-2" : ""}`}
              title={isCollapsed ? `${currentUser.username} (${currentUser.role})` : undefined}
            >
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold uppercase border border-brand-ink shrink-0
                ${currentUser.role === "admin" ? "bg-brand-ink text-brand-bg" : "bg-brand-bg text-brand-ink"}
              `}>
                {currentUser.username.substring(0, 2)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-brand-ink block truncate font-display uppercase tracking-wide">{currentUser.username}</span>
                  <span className="text-[9px] text-brand-ink/50 font-mono uppercase tracking-wider flex items-center gap-1">
                    {currentUser.role === "admin" ? (
                      <>
                        <Shield className="w-2.5 h-2.5 text-brand-ink" />
                        <span>Admin</span>
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-2.5 h-2.5 text-brand-ink/55" />
                        <span>Student</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Admin Switch Board panel */}
          {currentUser?.role === "admin" && (
            <div className="mb-6 shrink-0">
              <button
                id="btn-sidebar-toggle-admin"
                onClick={() => {
                  onToggleAdminDashboard(!showAdminDashboard);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-center border text-xs font-bold uppercase tracking-wider transition-all duration-200 text-left font-display
                  ${isCollapsed ? "p-2.5" : "px-3 py-2.5 gap-2"}
                  ${showAdminDashboard
                    ? "bg-brand-accent/10 text-brand-accent border-brand-accent/30"
                    : "bg-brand-ink text-brand-bg border-brand-ink hover:bg-brand-ink/90"
                  }
                `}
                title={isCollapsed ? (showAdminDashboard ? "Ir al Simulador" : "Panel Administrador") : undefined}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{showAdminDashboard ? "Ir al Simulador" : "Panel Administrador"}</span>}
              </button>
            </div>
          )}

          {/* Module Navigation with Categories (Only show if NOT in admin dashboard view) */}
          {!showAdminDashboard ? (
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* Generic Competencies */}
              <div>
                <div className={`px-1 mb-2 flex flex-col ${isCollapsed ? "items-center" : ""}`}>
                  {isCollapsed ? (
                    <span className="text-brand-accent text-[8px] font-mono font-bold uppercase tracking-widest" title="Competencias Genéricas">GEN</span>
                  ) : (
                    <span className="text-brand-accent text-[9px] font-mono font-bold uppercase tracking-widest">Competencias Genéricas</span>
                  )}
                </div>
                <nav className="space-y-1">
                  {genericModules.map((mod) => {
                    const isActive = currentModuleId === mod.id;
                    return (
                      <button
                        id={`nav-${mod.id}`}
                        key={mod.id}
                        onClick={() => {
                          onSelectModule(mod.id);
                          setIsOpen(false);
                        }}
                        className={`
                          w-full flex items-center border transition-all duration-200 text-left font-display uppercase tracking-wider text-[11px]
                          ${isCollapsed ? "p-3 justify-center" : "px-3 py-2.5 gap-3"}
                          ${isActive 
                            ? "bg-brand-ink text-brand-bg border-brand-ink" 
                            : "text-brand-ink/75 border-transparent hover:border-brand-ink hover:text-brand-ink"
                          }
                        `}
                        title={isCollapsed ? mod.name : undefined}
                      >
                        <span className={`shrink-0 ${isActive ? "text-brand-bg/80" : "text-brand-ink/40"}`}>
                          {getIcon(mod.icon)}
                        </span>
                        {!isCollapsed && <span className="truncate">{mod.name}</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Professional Competencies */}
              <div>
                <div className={`px-1 mb-2 flex flex-col ${isCollapsed ? "items-center" : ""}`}>
                  {isCollapsed ? (
                    <span className="text-brand-ink/60 text-[8px] font-mono font-bold uppercase tracking-widest" title="Competencias Profesionales">PRO</span>
                  ) : (
                    <span className="text-brand-ink/60 text-[9px] font-mono font-bold uppercase tracking-widest">Competencias Profesionales</span>
                  )}
                </div>
                <nav className="space-y-1">
                  {professionalModules.map((mod) => {
                    const isActive = currentModuleId === mod.id;
                    return (
                      <button
                        id={`nav-${mod.id}`}
                        key={mod.id}
                        onClick={() => {
                          onSelectModule(mod.id);
                          setIsOpen(false);
                        }}
                        className={`
                          w-full flex items-center border transition-all duration-200 text-left font-display uppercase tracking-wider text-[11px]
                          ${isCollapsed ? "p-3 justify-center" : "px-3 py-2.5 gap-3"}
                          ${isActive 
                            ? "bg-brand-ink text-brand-bg border-brand-ink" 
                            : "text-brand-ink/75 border-transparent hover:border-brand-ink hover:text-brand-ink"
                          }
                        `}
                        title={isCollapsed ? mod.name : undefined}
                      >
                        <span className={`shrink-0 ${isActive ? "text-brand-bg/80" : "text-brand-ink/40"}`}>
                          {getIcon(mod.icon)}
                        </span>
                        {!isCollapsed && <span className="truncate">{mod.name}</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center p-4 border border-brand-ink/10 bg-white text-center
              ${isCollapsed ? "p-2" : "p-4"}`}
              title={isCollapsed ? "Gobernanza de Datos" : undefined}
            >
              <Shield className="w-5 h-5 text-brand-accent mb-2 shrink-0" />
              {!isCollapsed && (
                <>
                  <p className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-ink">Gobernanza de Datos</p>
                  <p className="text-[9px] text-brand-ink/60 font-mono mt-1 uppercase tracking-wider">Puntuaciones generales de estudiantes.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="pt-4 border-t border-brand-ink/10 mt-auto space-y-3 shrink-0">
          {/* Progress / Stats inside Sidebar */}
          {!showAdminDashboard && (
            <div className={`bg-white border border-brand-ink/10 ${isCollapsed ? "p-2" : "p-3"}`}>
              {isCollapsed ? (
                <div className="flex flex-col items-center gap-2 text-center" title={`Contestadas: ${completedCount} | Puntaje: ${cumulativeScore} PTS`}>
                  <span className="font-mono text-[9px] font-bold text-brand-accent leading-none">{cumulativeScore}</span>
                  <button
                    id="btn-reset-progreso"
                    onClick={() => {
                      setConfirmModal({
                        title: "Reiniciar Progreso",
                        message: "¿Estás seguro de que deseas reiniciar todo tu progreso y puntajes? Esta acción es irreversible.",
                        onConfirm: onGlobalReset
                      });
                    }}
                    className="p-1 border border-brand-ink/10 hover:border-brand-ink text-brand-ink transition-all flex items-center justify-center"
                    title="Reiniciar Progreso"
                  >
                    <RotateCcw className="w-3 h-3 text-brand-accent shrink-0" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-brand-ink/60 mb-1">
                    <span>Contestadas</span>
                    <span className="font-bold text-brand-ink">{completedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-brand-ink/60 mb-2">
                    <span>Puntaje Total</span>
                    <span className="font-bold text-brand-accent">{cumulativeScore} PTS</span>
                  </div>
                  <button
                    id="btn-reset-progreso"
                    onClick={() => {
                      setConfirmModal({
                        title: "Reiniciar Progreso",
                        message: "¿Estás seguro de que deseas reiniciar todo tu progreso y puntajes? Esta acción es irreversible.",
                        onConfirm: onGlobalReset
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 mt-1 py-1.5 border border-brand-ink/20 hover:border-brand-ink text-brand-ink text-[10px] font-display font-bold uppercase tracking-wider transition-all"
                  >
                    <RotateCcw className="w-3 h-3 text-brand-accent" />
                    <span>Reiniciar Progreso</span>
                  </button>
                </>
              )}
            </div>
          )}

          <button 
            id="btn-salir"
            onClick={() => {
              setConfirmModal({
                title: "Cerrar Sesión",
                message: "¿Estás seguro de que deseas cerrar sesión y salir del simulador?",
                onConfirm: onLogout
              });
            }}
            className={`w-full flex items-center justify-center border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-bg text-[10px] font-display font-bold uppercase tracking-wider transition-all
              ${isCollapsed ? "p-2.5" : "px-4 py-2 gap-2"}`}
            title={isCollapsed ? "Salir de la Sesión" : undefined}
          >
            <LogOut className="w-3 h-3 shrink-0" />
            {!isCollapsed && <span>Salir de la Sesión</span>}
          </button>

          {/* Collapse/Expand Toggle Button (Only on desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 text-[9px] font-mono font-bold uppercase tracking-widest text-brand-ink/50 hover:text-brand-ink border border-dashed border-brand-ink/15 hover:border-brand-ink transition-all"
            title={isCollapsed ? "Ampliar menú" : "Contraer menú"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-brand-accent shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-brand-accent shrink-0" />
                <span>Contraer Menú</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-brand-ink/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-brand-ink/20 p-6 max-w-sm w-full space-y-4 shadow-xl rounded-none text-brand-ink"
            >
              <div className="flex items-center gap-3 border-b border-brand-ink/10 pb-3">
                <div className="p-2 bg-brand-bg border border-brand-ink/10">
                  <HelpCircle className="w-5 h-5 text-brand-accent animate-pulse" />
                </div>
                <h3 className="font-display font-bold uppercase tracking-wider text-sm">{confirmModal.title}</h3>
              </div>
              <p className="text-xs text-brand-ink/75 leading-relaxed font-inter">{confirmModal.message}</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2 bg-brand-bg text-brand-ink border border-brand-ink/15 hover:border-brand-ink font-display font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 py-2 bg-brand-accent text-brand-bg font-display font-bold text-xs uppercase tracking-wider hover:bg-brand-accent/90 transition-all border border-brand-accent"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
