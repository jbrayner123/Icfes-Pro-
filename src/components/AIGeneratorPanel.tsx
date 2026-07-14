import { useState, useEffect } from "react";
import { Sparkles, Brain, CheckCircle, RefreshCw, AlertCircle, Cpu } from "lucide-react";

interface AIGeneratorPanelProps {
  currentModuleId: string;
  currentModuleName: string;
  onQuestionsUpdated: () => void;
}

interface ModuleStat {
  id: string;
  name: string;
  total: number;
  mockCount: number;
  genCount: number;
}

export default function AIGeneratorPanel({
  currentModuleId,
  currentModuleName,
  onQuestionsUpdated,
}: AIGeneratorPanelProps) {
  const [stats, setStats] = useState<ModuleStat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [provider, setProvider] = useState<"gemini" | "deepseek">("deepseek");
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);
  const [deepseekConfigured, setDeepseekConfigured] = useState<boolean>(false);

  // Fetch stats of questions per module
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || []);
        setGeminiConfigured(!!data.geminiConfigured);
        setDeepseekConfigured(!!data.deepseekConfigured);
        
        // Auto select active provider, preferring deepseek if configured
        if (data.deepseekConfigured) {
          setProvider("deepseek");
        } else if (data.geminiConfigured) {
          setProvider("gemini");
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentModuleId]);

  // Loading messages rotation
  const loadingPhrases = [
    `Iniciando agente de Inteligencia Artificial ${provider === "deepseek" ? "DeepSeek (V3)" : "Gemini 3.5 Flash"}...`,
    `Analizando objetivos académicos para '${currentModuleName}'...`,
    "Investigando marcos de competencia oficiales Pro Icfes...",
    "Redactando enunciados analíticos de alta complejidad técnica...",
    "Generando opciones de respuesta lógicas con distractores plausibles...",
    "Estructurando justificaciones y retroalimentaciones académicas...",
    "Registrando las nuevas preguntas en la base de datos..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let index = 0;
      setLoadingMessage(loadingPhrases[0]);
      interval = setInterval(() => {
        index = (index + 1) % loadingPhrases.length;
        setLoadingMessage(loadingPhrases[index]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading, currentModuleId, currentModuleName, provider]);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduloId: currentModuleId,
          count: 5,
          provider: provider,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`¡Éxito! La IA ${provider === "deepseek" ? "DeepSeek" : "Gemini"} ha generado 5 preguntas académicas adicionales para '${currentModuleName}'.`);
        onQuestionsUpdated();
        await fetchStats();
      } else {
        setError(data.error || "Ocurrió un error al generar las preguntas.");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor de IA para generar preguntas.");
    } finally {
      setLoading(false);
    }
  };

  const getModuleTotal = (id: string) => {
    const mod = stats.find((s) => s.id === id);
    return mod ? mod.total : 0;
  };

  return (
    <div id="ai-generator-panel" className="bg-white rounded-none border border-brand-ink/15 shadow-none overflow-hidden mt-8">
      {/* Panel Header */}
      <div className="bg-brand-ink p-6 text-brand-bg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-ink">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-bg/10 border border-brand-bg/10">
            <Cpu className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="font-display font-bold uppercase tracking-wide text-lg text-brand-bg">Consola de Inteligencia Artificial</h2>
            <p className="text-brand-bg/60 text-xs mt-0.5 font-inter">Generación, búsqueda y expansión automática de reactivos Pro Icfes (Gemini / DeepSeek)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-brand-bg/5 border border-brand-bg/10 px-3.5 py-1.5">
          <span className="w-2 h-2 rounded-none bg-brand-accent animate-pulse"></span>
          <span className="text-[10px] text-brand-bg font-mono font-bold uppercase tracking-widest">Soporte Multi-Modelo Activo</span>
        </div>
      </div>

      <div className="p-6 space-y-6 text-brand-ink">
        {/* Metric Grid showing counts per subject */}
        <div>
          <h3 className="text-brand-ink text-[10px] font-display font-bold uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-brand-accent" />
            <span>Estado de Preguntas por Materia (Mínimo: 20 por materia)</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((mod) => {
              const meetsMin = mod.total >= 20;
              const isCurrent = mod.id === currentModuleId;
              return (
                <div
                  key={mod.id}
                  className={`p-3 rounded-none border text-center transition-all ${
                    isCurrent
                      ? "bg-brand-bg border-brand-ink border-2"
                      : "bg-brand-bg/40 border-brand-ink/10"
                  }`}
                >
                  <p className="text-brand-ink/55 text-[9px] font-mono uppercase tracking-wider truncate px-1" title={mod.name}>
                    {mod.name}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className={`text-sm font-display font-bold ${meetsMin ? "text-green-700" : "text-brand-ink"}`}>
                      {mod.total}
                    </span>
                    <span className="text-brand-ink/40 text-xs">/ 20</span>
                    {meetsMin ? (
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-none bg-brand-accent shrink-0" title="Pendiente de completar"></span>
                    )}
                  </div>
                  <div className="w-full bg-brand-ink/10 h-1 mt-2.5">
                    <div
                      className={`h-full transition-all duration-500 ${
                        meetsMin ? "bg-green-600" : "bg-brand-ink"
                      }`}
                      style={{ width: `${Math.min(100, (mod.total / 20) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Provider Selector Section */}
        <div className="border border-brand-ink/10 p-5 bg-brand-bg/20 space-y-3 rounded-none">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink/75">
              Modelo de IA Seleccionado
            </h4>
            <span className="text-[10px] text-brand-ink/50 font-mono">
              Elige el motor de IA para la generación
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* DeepSeek Option */}
            <button
              onClick={() => setProvider("deepseek")}
              disabled={loading}
              className={`p-4 border text-left flex flex-col justify-between transition-all rounded-none ${
                provider === "deepseek"
                  ? "bg-white border-brand-ink border-2 shadow-sm"
                  : "bg-brand-bg/40 border-brand-ink/10 hover:bg-brand-bg/80"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="font-display font-bold text-sm text-brand-ink">DeepSeek-V3</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider rounded-none ${
                  deepseekConfigured 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {deepseekConfigured ? "Activo" : "Inactivo (Falta Key)"}
                </span>
              </div>
              <p className="text-[11px] text-brand-ink/65 mt-2 leading-normal">
                Generador de máxima precisión y extremadamente económico. Ideal para redacción analítica de enunciados largos.
              </p>
            </button>

            {/* Gemini Option */}
            <button
              onClick={() => setProvider("gemini")}
              disabled={loading}
              className={`p-4 border text-left flex flex-col justify-between transition-all rounded-none ${
                provider === "gemini"
                  ? "bg-white border-brand-ink border-2 shadow-sm"
                  : "bg-brand-bg/40 border-brand-ink/10 hover:bg-brand-bg/80"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="font-display font-bold text-sm text-brand-ink">Gemini 3.5 Flash</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider rounded-none ${
                  geminiConfigured 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {geminiConfigured ? "Activo" : "Inactivo (Falta Key)"}
                </span>
              </div>
              <p className="text-[11px] text-brand-ink/65 mt-2 leading-normal">
                Motor nativo ultra rápido estructurado en JSON nativo mediante esquemas estrictos de Gemini.
              </p>
            </button>
          </div>
        </div>

        {/* Action Panel for Current Module */}
        <div className="bg-brand-bg border border-brand-ink/15 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[9px] font-mono font-bold text-brand-bg bg-brand-ink px-2 py-0.5 border border-brand-ink uppercase tracking-widest">
              Módulo Seleccionado
            </span>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-brand-ink pt-1">
              {currentModuleName} — {getModuleTotal(currentModuleId)} Preguntas Disponibles
            </h4>
            <p className="text-brand-ink/65 text-xs leading-relaxed font-inter">
              La IA puede expandir automáticamente el banco de preguntas mediante la búsqueda conceptual y redacción de nuevos casos de estudio alineados a la estructura ICFES.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <button
              onClick={handleGenerateQuestions}
              disabled={loading}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-none font-display font-bold text-xs uppercase tracking-widest border transition-all ${
                loading
                  ? "bg-brand-ink/10 text-brand-ink/30 border-brand-ink/5 cursor-not-allowed"
                  : "bg-brand-ink text-brand-bg border-brand-ink hover:bg-brand-ink/95"
              }`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-brand-accent" />
              )}
              <span>{loading ? "Generando con IA..." : `Generar 5 con ${provider === "deepseek" ? "DeepSeek" : "Gemini"}`}</span>
            </button>
          </div>
        </div>

        {/* Loading State Overlay */}
        {loading && (
          <div className="bg-brand-bg border border-brand-ink/20 p-4 flex items-center gap-3 rounded-none animate-pulse">
            <RefreshCw className="w-5 h-5 text-brand-accent animate-spin" />
            <div className="space-y-1">
              <p className="text-xs text-brand-ink font-mono font-bold uppercase tracking-wide">{loadingMessage}</p>
              <p className="text-[10px] text-brand-ink/50 font-mono">Buscando fuentes, planteando distractores y alineando retroalimentación de calidad...</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-950 p-4 flex items-start gap-2.5 rounded-none">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase font-display tracking-wider">{success}</p>
              <p className="text-[10px] text-green-800/80 mt-1 font-inter">
                Las preguntas han sido persistidas con éxito en la base de datos local y se han integrado al examen.
              </p>
            </div>
          </div>
        )}

        {/* Error / Key Advisory */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 flex items-start gap-2.5 rounded-none">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase font-display tracking-wider">Generación de Preguntas en Vivo</p>
              <p className="text-xs text-amber-900/90 leading-relaxed font-inter">
                {error.includes("GEMINI_API_KEY") || error.includes("DEEPSEEK_API_KEY") || error.includes("entorno") ? (
                  <>
                    Para la generación en tiempo real con IA, define tu clave de API <code className="bg-amber-100 border border-amber-200 px-1 py-0.5 font-mono text-[11px] font-bold">{provider === "deepseek" ? "DEEPSEEK_API_KEY" : "GEMINI_API_KEY"}</code>. Mientras tanto, hemos pre-sembrado <strong className="font-semibold text-brand-ink">20 preguntas académicas por materia</strong> para que disfrutes de un examen completo offline.
                  </>
                ) : (
                  error
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
