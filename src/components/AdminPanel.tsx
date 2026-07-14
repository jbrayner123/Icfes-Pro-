import { useState, useEffect } from "react";
import { User, UserScore } from "../types";
import { Users, BarChart3, Search, Trash2, Calendar, Award, RefreshCw, Layers, ShieldCheck, ArrowUpRight, HelpCircle, AlertTriangle } from "lucide-react";
import { MODULES } from "./Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { getStoredUsers, saveUsers } from "../data/userStorage";

interface AdminPanelProps {
  onBackToSimulator: () => void;
  onLogout: () => void;
}

export default function AdminPanel({ onBackToSimulator, onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Reload users from server/local
  const loadUsers = async () => {
    const data = await getStoredUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle deleting a user
  const handleDeleteUser = (username: string) => {
    if (username === "admin") {
      setAlertModal({
        title: "Acción Denegada",
        message: "No puedes eliminar la cuenta de administrador principal."
      });
      return;
    }

    setConfirmModal({
      title: "Eliminar Usuario",
      message: `¿Estás seguro de que deseas eliminar al usuario "${username}" y todos sus puntajes? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        const updated = users.filter(u => u.username !== username);
        saveUsers(updated);
        setUsers(updated);
        if (selectedUser?.username === username) {
          setSelectedUser(null);
        }
      }
    });
  };

  // Handle resetting a user's scores
  const handleResetScores = (username: string) => {
    setConfirmModal({
      title: "Reiniciar Notas",
      message: `¿Estás seguro de que deseas reiniciar los puntajes de "${username}"?`,
      onConfirm: () => {
        const updated = users.map(u => {
          if (u.username === username) {
            return { ...u, scores: {} };
          }
          return u;
        });
        saveUsers(updated);
        setUsers(updated);
        const updatedSelected = updated.find(u => u.username === username);
        if (updatedSelected) {
          setSelectedUser(updatedSelected);
        }
      }
    });
  };

  // Calculate user total metrics
  const getUserTotals = (user: User) => {
    let totalScore = 0;
    let totalCompleted = 0;
    
    Object.values(user.scores).forEach((s: UserScore) => {
      totalScore += s.score;
      totalCompleted += s.completed;
    });

    return { totalScore, totalCompleted };
  };

  // Calculate general stats
  const totalUsers = users.length;
  const regularUsers = users.filter(u => u.role !== "admin");
  
  const averageScore = regularUsers.length > 0 
    ? Math.round(regularUsers.reduce((sum, u) => sum + getUserTotals(u).totalScore, 0) / regularUsers.length)
    : 0;

  const topStudent = regularUsers.length > 0
    ? [...regularUsers].sort((a, b) => getUserTotals(b).totalScore - getUserTotals(a).totalScore)[0]
    : null;

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-grow min-h-screen bg-brand-bg p-4 md:p-8 font-inter text-brand-ink">
      {/* Admin Header Progress Board */}
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navbar Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-brand-ink/15 p-6 rounded-none">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-brand-ink text-brand-bg border border-brand-ink">
              <ShieldCheck className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
              <p className="text-[10px] text-brand-ink/60 font-mono uppercase tracking-widest">Módulo de Administración</p>
              <h1 className="text-xl font-display font-bold uppercase tracking-wide text-brand-ink">Panel del Administrador</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="btn-back-simulator"
              onClick={onBackToSimulator}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-ink text-brand-bg font-display font-bold text-xs uppercase tracking-wider hover:bg-brand-ink/90 transition-all border border-brand-ink rounded-none"
            >
              <span>Ver Simulador</span>
              <ArrowUpRight className="w-4 h-4 text-brand-accent" />
            </button>
            <button
              id="btn-admin-logout"
              onClick={onLogout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-accent text-brand-accent font-display font-bold text-xs uppercase tracking-wider hover:bg-brand-accent hover:text-brand-bg rounded-none transition-all"
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Students Count */}
          <div className="bg-white border border-brand-ink/15 p-5 rounded-none flex items-center gap-4">
            <div className="p-3 bg-brand-bg border border-brand-ink/10 text-brand-ink">
              <Users className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-brand-ink/60">Estudiantes Registrados</p>
              <h3 className="text-2xl font-display font-bold text-brand-ink uppercase">{regularUsers.length}</h3>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="bg-white border border-brand-ink/15 p-5 rounded-none flex items-center gap-4">
            <div className="p-3 bg-brand-bg border border-brand-ink/10 text-brand-ink">
              <BarChart3 className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-brand-ink/60">Promedio de Puntaje</p>
              <h3 className="text-2xl font-display font-bold text-brand-ink uppercase">{averageScore} <span className="text-xs font-mono text-brand-ink/50 font-medium">PTS</span></h3>
            </div>
          </div>

          {/* Card 3: Top Student */}
          <div className="bg-white border border-brand-ink/15 p-5 rounded-none flex items-center gap-4">
            <div className="p-3 bg-brand-bg border border-brand-ink/10 text-brand-ink">
              <Award className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono uppercase tracking-widest text-brand-ink/60">Estudiante Líder</p>
              <h3 className="text-sm font-display font-bold text-brand-ink truncate uppercase tracking-wider">
                {topStudent ? `${topStudent.username} (${getUserTotals(topStudent).totalScore} PTS)` : "Ninguno"}
              </h3>
            </div>
          </div>
        </div>

        {/* Workspace Split Layout: Users List vs Drill-down Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Registered Users Table (7/12 width) */}
          <div className="lg:col-span-7 bg-white border border-brand-ink/15 p-6 rounded-none flex flex-col min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-display font-bold uppercase tracking-wide text-brand-ink">Listado de Estudiantes</h2>
                <p className="text-xs text-brand-ink/60 font-inter mt-1">Selecciona un estudiante para examinar su planilla detallada por competencia.</p>
              </div>
              
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-ink/15 rounded-none text-xs focus:outline-none focus:border-brand-ink transition-all font-medium text-brand-ink"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-ink/40">
                  <Search className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Users list table */}
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-ink/15 text-[10px] font-mono font-bold text-brand-ink/50 uppercase tracking-widest">
                    <th className="pb-3 pl-2">Estudiante</th>
                    <th className="pb-3">Rol</th>
                    <th className="pb-3 text-center">Puntaje Total</th>
                    <th className="pb-3 text-center">Preguntas</th>
                    <th className="pb-3 pr-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-ink/5 text-xs text-brand-ink">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-brand-ink/50 font-medium">
                        No se encontraron estudiantes registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const { totalScore, totalCompleted } = getUserTotals(user);
                      const isSelected = selectedUser?.username === user.username;
                      const isUserAdmin = user.role === "admin";
                      
                      return (
                        <tr 
                          key={user.username}
                          onClick={() => setSelectedUser(user)}
                          className={`
                            hover:bg-brand-bg cursor-pointer transition-colors group
                            ${isSelected ? "bg-brand-bg" : ""}
                          `}
                        >
                          <td className="py-3.5 pl-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs uppercase border border-brand-ink/10
                                ${isUserAdmin 
                                  ? "bg-brand-ink text-brand-bg" 
                                  : "bg-brand-bg text-brand-ink"
                                }
                              `}>
                                {user.username.substring(0, 2)}
                              </div>
                              <div>
                                <span className="font-bold block group-hover:text-brand-accent transition-colors font-display uppercase tracking-wide text-xs">{user.username}</span>
                                <span className="text-[9px] text-brand-ink/50 flex items-center gap-1 font-mono uppercase tracking-wider">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-wider
                              ${isUserAdmin 
                                ? "bg-brand-ink text-brand-bg border-brand-ink" 
                                : "bg-brand-bg text-brand-ink/60 border-brand-ink/10"
                              }
                            `}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3.5 text-center font-bold text-brand-accent font-mono text-xs">
                            {totalScore} PTS
                          </td>
                          <td className="py-3.5 text-center font-mono text-brand-ink/60">
                            {totalCompleted}
                          </td>
                          <td className="py-3.5 pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleResetScores(user.username)}
                                className="p-1.5 hover:bg-brand-bg border border-transparent hover:border-brand-ink/10 text-brand-ink/55 hover:text-brand-ink transition-colors"
                                title="Reiniciar puntajes"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                disabled={isUserAdmin}
                                className={`p-1.5 border border-transparent transition-colors 
                                  ${isUserAdmin 
                                    ? "text-brand-ink/10 cursor-not-allowed" 
                                    : "text-brand-ink/55 hover:bg-brand-accent/5 hover:border-brand-accent/20 hover:text-brand-accent"
                                  }
                                `}
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Student Detailed Breakdown (5/12 width) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-brand-ink/15 p-6 rounded-none flex-grow flex flex-col justify-between min-h-[500px]">
              {selectedUser ? (
                <div className="space-y-6 flex-grow flex flex-col justify-between">
                  {/* Selected Student profile info */}
                  <div>
                    <div className="flex justify-between items-start border-b border-brand-ink/15 pb-4">
                      <div>
                        <p className="text-[10px] text-brand-accent font-mono font-bold uppercase tracking-widest">Planilla de Notas</p>
                        <h2 className="text-lg font-display font-bold uppercase text-brand-ink mt-0.5">{selectedUser.username}</h2>
                        <span className="text-[9px] text-brand-ink/50 font-mono uppercase tracking-wider mt-1 block">
                          Creado: {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-brand-bg text-brand-ink px-3.5 py-2 border border-brand-ink/15 text-right">
                        <span className="text-[8px] font-mono uppercase block tracking-wider text-brand-ink/60">Puntaje Total</span>
                        <span className="text-base font-display font-bold text-brand-accent">
                          {getUserTotals(selectedUser).totalScore} PTS
                        </span>
                      </div>
                    </div>

                    {/* Breakdown per competency list */}
                    <div className="mt-6 space-y-4 max-h-[340px] overflow-y-auto pr-1">
                      <h3 className="text-[10px] font-display font-bold text-brand-ink uppercase tracking-widest flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-brand-accent" />
                        <span>Progreso por Competencia</span>
                      </h3>
                      
                      <div className="space-y-3">
                        {MODULES.map((mod) => {
                          const moduleScore = selectedUser.scores[mod.id] || {
                            score: 0,
                            completed: 0,
                            totalQuestions: 60,
                            updatedAt: ""
                          };

                          const percent = Math.round((moduleScore.completed / 60) * 100);

                          return (
                            <div key={mod.id} className="p-3 bg-brand-bg border border-brand-ink/10 space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-display font-bold uppercase tracking-wide text-xs text-brand-ink truncate">{mod.name}</span>
                                <span className="text-xs font-bold text-brand-accent font-mono shrink-0">
                                  {moduleScore.score} PTS
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center text-[9px] text-brand-ink/50 font-mono uppercase tracking-wider">
                                <span>Contestadas: {moduleScore.completed}</span>
                                <span>{percent}%</span>
                              </div>
                              
                              {/* Custom mini progress bar */}
                              <div className="w-full bg-brand-ink/10 h-1">
                                <div 
                                  className="bg-brand-ink h-1 transition-all duration-300" 
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-brand-ink/15 pt-4 flex gap-3">
                    <button
                      onClick={() => handleResetScores(selectedUser.username)}
                      className="flex-grow py-2 bg-brand-ink text-brand-bg font-display font-bold text-xs uppercase tracking-wider hover:bg-brand-ink/90 transition-all border border-brand-ink"
                    >
                      Reiniciar Notas
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                      }}
                      className="flex-grow py-2 bg-brand-bg text-brand-ink border border-brand-ink/15 hover:border-brand-ink font-display font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Cerrar Detalles
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state when no student is selected */
                <div className="flex-grow flex flex-col items-center justify-center py-12 text-center text-brand-ink/50 gap-3">
                  <div className="p-3 bg-brand-bg border border-brand-ink/10">
                    <BarChart3 className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold uppercase tracking-wider text-brand-ink text-xs">Sin Selección</h3>
                    <p className="text-[11px] text-brand-ink/60 max-w-xs mt-1.5 leading-relaxed font-inter">
                      Haz clic en un estudiante en la tabla de la izquierda para analizar detalladamente su hoja de respuestas por competencia.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

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

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {alertModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-brand-ink/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-brand-ink/20 p-6 max-w-sm w-full space-y-4 shadow-xl rounded-none text-brand-ink"
            >
              <div className="flex items-center gap-3 border-b border-brand-ink/10 pb-3">
                <div className="p-2 bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-display font-bold uppercase tracking-wider text-sm">{alertModal.title}</h3>
              </div>
              <p className="text-xs text-brand-ink/75 leading-relaxed font-inter">{alertModal.message}</p>
              <div className="pt-2">
                <button
                  onClick={() => setAlertModal(null)}
                  className="w-full py-2 bg-brand-ink text-brand-bg hover:bg-brand-ink/90 font-display font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
