import { useState, useEffect } from "react";
import Sidebar, { MODULES } from "./components/Sidebar";
import HeaderProgress from "./components/HeaderProgress";
import QuestionCard from "./components/QuestionCard";
import FeedbackPanel from "./components/FeedbackPanel";
import SummaryStats from "./components/SummaryStats";
import AIGeneratorPanel from "./components/AIGeneratorPanel";
import LoginScreen from "./components/LoginScreen";
import AdminPanel from "./components/AdminPanel";
import { fetchQuestionsFromBackend } from "./data/questions";
import { Question, Option, User, UserScore } from "./types";
import { getStoredUsers, saveUsers } from "./data/userStorage";
import { ArrowRight, RefreshCw, Code, ArrowLeft, BrainCircuit, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);

  // Navigation & Category States
  const [currentModuleId, setCurrentModuleId] = useState<string>("communication");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<string | number, string>>({});
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("engiexam_sidebar_collapsed") === "true";
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("engiexam_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Restore user session and sync with server on mount
  useEffect(() => {
    async function syncAndRestoreSession() {
      // Fetch fresh users from the server (updates localStorage)
      const freshUsers = await getStoredUsers();

      const savedSession = localStorage.getItem("engiexam_session");
      if (savedSession) {
        try {
          const parsedUser: User = JSON.parse(savedSession);
          
          // Try to find the user in the fresh users list to get updated data
          const freshUser = freshUsers.find(u => u.username === parsedUser.username) || parsedUser;
          setCurrentUser(freshUser);
          
          // Re-calculate their score totals
          let totalScore = 0;
          let totalCompleted = 0;
          Object.values(freshUser.scores).forEach((s) => {
            totalScore += s.score;
            totalCompleted += s.completed;
          });
          setCumulativeScore(totalScore);
          setCompletedCount(totalCompleted);
          
          if (freshUser.role === "admin") {
            setShowAdminDashboard(true);
          }
        } catch (err) {
          console.error("Failed to parse saved session", err);
        }
      }
    }

    syncAndRestoreSession();
  }, []);

  // Fetch questions when category changes
  useEffect(() => {
    if (!currentUser) return;
    
    async function loadModuleQuestions() {
      setLoading(true);
      
      try {
        const data = await fetchQuestionsFromBackend(currentModuleId);
        setQuestions(data);
        setCurrentQuestionIndex(0);
        setShowSummary(false);
      } catch (error) {
        console.error("Error loading questions", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadModuleQuestions();
  }, [currentModuleId, refreshTrigger, currentUser?.username]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("engiexam_session", JSON.stringify(user));

    // Calculate their score totals
    let totalScore = 0;
    let totalCompleted = 0;
    Object.values(user.scores).forEach((s) => {
      totalScore += s.score;
      totalCompleted += s.completed;
    });
    setCumulativeScore(totalScore);
    setCompletedCount(totalCompleted);

    if (user.role === "admin") {
      setShowAdminDashboard(true);
    } else {
      setShowAdminDashboard(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("engiexam_session");
    setCurrentUser(null);
    setShowAdminDashboard(false);
    setUserAnswers({});
    setCumulativeScore(0);
    setCompletedCount(0);
    setCurrentQuestionIndex(0);
    setShowSummary(false);
  };

  const updateUserScore = (moduleId: string, scoreDelta: number, completedDelta: number, total: number) => {
    if (!currentUser) return;

    const storedUsers = localStorage.getItem("engiexam_users");
    if (!storedUsers) return;
    const usersList: User[] = JSON.parse(storedUsers);

    const updatedUsersList = usersList.map(u => {
      if (u.username === currentUser.username) {
        const currentModuleScore = u.scores[moduleId] || {
          score: 0,
          completed: 0,
          totalQuestions: total,
          updatedAt: new Date().toISOString()
        };

        const updatedScore: UserScore = {
          score: Math.max(0, currentModuleScore.score + scoreDelta),
          completed: Math.max(0, currentModuleScore.completed + completedDelta),
          totalQuestions: total,
          updatedAt: new Date().toISOString()
        };

        const updatedScores = {
          ...u.scores,
          [moduleId]: updatedScore
        };

        return {
          ...u,
          scores: updatedScores
        };
      }
      return u;
    });

    saveUsers(updatedUsersList);

    const updatedUser = updatedUsersList.find(u => u.username === currentUser.username);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem("engiexam_session", JSON.stringify(updatedUser));
    }
  };

  const resetUserModuleScore = (moduleId: string) => {
    if (!currentUser) return;

    const storedUsers = localStorage.getItem("engiexam_users");
    if (!storedUsers) return;
    const usersList: User[] = JSON.parse(storedUsers);

    const updatedUsersList = usersList.map(u => {
      if (u.username === currentUser.username) {
        const updatedScores = { ...u.scores };
        delete updatedScores[moduleId];
        return { ...u, scores: updatedScores };
      }
      return u;
    });

    saveUsers(updatedUsersList);

    const updatedUser = updatedUsersList.find(u => u.username === currentUser.username);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem("engiexam_session", JSON.stringify(updatedUser));
      
      // Re-calculate totals
      let totalScore = 0;
      let totalCompleted = 0;
      Object.values(updatedUser.scores).forEach((s) => {
        totalScore += s.score;
        totalCompleted += s.completed;
      });
      setCumulativeScore(totalScore);
      setCompletedCount(totalCompleted);
    }
  };

  const resetUserAllScores = () => {
    if (!currentUser) return;

    const storedUsers = localStorage.getItem("engiexam_users");
    if (!storedUsers) return;
    const usersList: User[] = JSON.parse(storedUsers);

    const updatedUsersList = usersList.map(u => {
      if (u.username === currentUser.username) {
        return { ...u, scores: {} };
      }
      return u;
    });

    saveUsers(updatedUsersList);

    const updatedUser = updatedUsersList.find(u => u.username === currentUser.username);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem("engiexam_session", JSON.stringify(updatedUser));
      setCumulativeScore(0);
      setCompletedCount(0);
    }
  };

  // Current active question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Has the current question been answered?
  const selectedAnswerLetra = currentQuestion ? userAnswers[currentQuestion.id_pregunta] : undefined;
  const isAnswered = selectedAnswerLetra !== undefined;

  // Handle option selection
  const handleSelectOption = (option: Option) => {
    if (!currentQuestion || isAnswered) return;

    // Save answer
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id_pregunta]: option.letra
    }));

    // Increment completed count
    setCompletedCount(prev => prev + 1);

    // If correct, reward 10 points
    let pointsEarned = 0;
    if (option.es_correcta) {
      setCumulativeScore(prev => prev + 10);
      pointsEarned = 10;
    }

    // Persist user scores locally
    updateUserScore(currentModuleId, pointsEarned, 1, questions.length);
  };

  // Move to next question or show summary
  const handleNext = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  // Move to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Restart simulation for current module
  const handleRestartModule = () => {
    // Clear answers for current questions
    setUserAnswers(prev => {
      const copy = { ...prev };
      questions.forEach(q => {
        if (copy[q.id_pregunta]) {
          delete copy[q.id_pregunta];
          setCompletedCount(c => Math.max(0, c - 1));
        }
      });
      return copy;
    });
    
    // Reset scores for this module in user storage
    resetUserModuleScore(currentModuleId);

    // Reset indices
    setCurrentQuestionIndex(0);
    setShowSummary(false);
  };

  // Global Reset of all scores, progress and answers
  const handleGlobalReset = () => {
    setUserAnswers({});
    setCumulativeScore(0);
    setCompletedCount(0);
    setCurrentQuestionIndex(0);
    setShowSummary(false);
    
    resetUserAllScores();
  };

  // Selected module metadata
  const currentModule = MODULES.find(m => m.id === currentModuleId) || MODULES[MODULES.length - 1];

  // Correct answer for current question
  const correctOption = currentQuestion?.opciones.find(o => o.es_correcta);
  const isCurrentSelectionCorrect = !!(correctOption && (selectedAnswerLetra === correctOption.text || selectedAnswerLetra === correctOption.letra));

  // Render Login Screen if user is not authenticated
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-brand-bg text-brand-ink min-h-screen flex flex-col lg:flex-row antialiased font-inter">
      
      {/* Dynamic Navigation Sidebar */}
      <Sidebar 
        currentModuleId={currentModuleId}
        onSelectModule={(id) => {
          setCurrentModuleId(id);
          setShowAdminDashboard(false);
        }}
        cumulativeScore={cumulativeScore}
        totalQuestionsCount={questions.length}
        completedCount={completedCount}
        onGlobalReset={handleGlobalReset}
        currentUser={currentUser}
        onLogout={handleLogout}
        showAdminDashboard={showAdminDashboard}
        onToggleAdminDashboard={setShowAdminDashboard}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Canvas Area (Either Admin Panel or Quiz Canvas) */}
      <div className={`flex-grow min-h-screen flex flex-col pt-20 lg:pt-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {showAdminDashboard ? (
          <AdminPanel 
            onBackToSimulator={() => setShowAdminDashboard(false)}
            onLogout={handleLogout}
          />
        ) : (
          <main className="flex-grow flex flex-col">
          <div className="max-w-[850px] w-full mx-auto px-4 md:px-8 py-8 md:py-12 flex-grow flex flex-col gap-6">
            
            {/* Welcome Info Board / Fast API logs */}
            <div className="bg-white border border-brand-ink/15 p-4 rounded-none shadow-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-bg border border-brand-ink/10 text-brand-ink rounded-none shrink-0">
                  <BrainCircuit className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <p className="text-[10px] text-brand-ink/60 font-mono uppercase tracking-widest">Simulador de Competencias</p>
                  <h2 className="text-sm font-display font-bold uppercase tracking-wide text-brand-ink">Pruebas Pro Icfes - Ingeniería de Sistemas</h2>
                </div>
              </div>
              
              {/* Action buttons & status indicator */}
              <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
                <button
                  id="btn-global-reset-header"
                  onClick={() => {
                    if (confirm("¿Estás seguro de que deseas reiniciar todo tu progreso y puntajes?")) {
                      handleGlobalReset();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-bg hover:bg-brand-bg/90 text-brand-ink border border-brand-ink/15 hover:border-brand-ink rounded-none text-xs font-display font-bold uppercase tracking-wide transition-all"
                  title="Reiniciar todo el simulador"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Reiniciar Progreso</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none bg-brand-accent animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold text-brand-ink/75 bg-brand-bg border border-brand-ink/10 px-3 py-1 uppercase tracking-wider">
                    Preguntas IA
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              /* Loading State spinner */
              <div className="flex-grow flex flex-col justify-center items-center py-24 gap-4 bg-white border border-brand-ink/15 rounded-none shadow-none">
                <RefreshCw className="w-7 h-7 text-brand-accent animate-spin" />
                <p className="text-xs font-bold text-brand-ink/60 font-mono uppercase tracking-wider">
                  GET /api/questions?modulo={currentModuleId}...
                </p>
              </div>
            ) : showSummary ? (
              /* Quiz Completed Summary Screen */
              <SummaryStats
                moduleName={currentModule.name}
                questions={questions}
                userAnswers={userAnswers}
                onRestart={handleRestartModule}
                onSelectAnotherModule={() => setCurrentModuleId("communication")}
              />
            ) : questions.length === 0 ? (
              /* No questions state */
              <div className="bg-white border border-brand-ink/15 p-8 text-center text-brand-ink/60 rounded-none shadow-none font-mono text-xs uppercase tracking-wider">
                No hay preguntas cargadas para este módulo todavía.
              </div>
            ) : (
              /* Active Quiz Interface */
              <div className="bg-white border border-brand-ink/15 p-6 md:p-8 rounded-none shadow-none flex flex-col justify-between min-h-[450px]">
                <div>
                  {/* Header and dynamic Progress bar */}
                  <HeaderProgress
                    moduleName={currentModule.name}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                  />

                  {/* Animated Question & Option list card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion.id_pregunta}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <QuestionCard
                        question={currentQuestion}
                        selectedOptionLetra={selectedAnswerLetra}
                        onSelectOption={handleSelectOption}
                        isAnswered={isAnswered}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Explanatory feedback panel displayed upon selection */}
                  <AnimatePresence>
                    {isAnswered && correctOption && (
                      <FeedbackPanel
                        isCorrect={isCurrentSelectionCorrect || false}
                        selectedOptionLetra={selectedAnswerLetra || ""}
                        correctOptionLetra={correctOption.letra}
                        explicacion={currentQuestion.explicacion_retroalimentacion}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation Action Footer */}
                <div className="mt-8 pt-5 border-t border-brand-ink/10 flex justify-between items-center">
                  {/* Back button */}
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wider rounded-none border transition-all
                      ${currentQuestionIndex === 0
                        ? "text-brand-ink/20 border-transparent cursor-not-allowed"
                        : "text-brand-ink/60 border-transparent hover:border-brand-ink/10 hover:text-brand-ink hover:bg-brand-bg"
                      }
                    `}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  {/* Siguiente Pregunta button (Lock conditional state) */}
                  <button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className={`
                      flex items-center gap-2 px-5 py-3 rounded-none text-xs font-display font-bold uppercase tracking-wider transition-all border
                      ${isAnswered
                        ? "bg-brand-ink text-brand-bg border-brand-ink hover:bg-brand-ink/90 cursor-pointer"
                        : "bg-brand-bg text-brand-ink/30 border-brand-ink/10 cursor-not-allowed"
                      }
                    `}
                  >
                    <span>
                      {currentQuestionIndex + 1 === questions.length ? "Ver Resultados" : "Siguiente Pregunta"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand-accent" />
                  </button>
                </div>
              </div>
            )}

            {/* AI Generator Control Console */}
            <AIGeneratorPanel
              currentModuleId={currentModuleId}
              currentModuleName={currentModule.name}
              onQuestionsUpdated={() => setRefreshTrigger(prev => prev + 1)}
            />

          </div>
        </main>
      )}
      </div>
    </div>
  );
}
