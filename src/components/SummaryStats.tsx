import { Question } from "../types";
import { Award, RotateCcw, Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface SummaryStatsProps {
  moduleName: string;
  questions: Question[];
  userAnswers: Record<string | number, string>; // questionId -> selectedOptionLetra
  onRestart: () => void;
  onSelectAnotherModule: () => void;
}

export default function SummaryStats({
  moduleName,
  questions,
  userAnswers,
  onRestart,
  onSelectAnotherModule,
}: SummaryStatsProps) {
  // Compute results
  let correctCount = 0;
  questions.forEach((q) => {
    const selected = userAnswers[q.id_pregunta];
    const correctOption = q.opciones.find((o) => o.es_correcta);
    if (selected && correctOption && selected === correctOption.letra) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const points = correctCount * 10;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-brand-ink/15 p-6 md:p-8 rounded-none shadow-none flex flex-col gap-6 text-brand-ink"
    >
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-bg text-brand-ink border border-brand-ink/15 mb-2">
          <Award className="w-8 h-8 text-brand-accent" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wider text-brand-ink">
          ¡Módulo Completado!
        </h2>
        <p className="font-inter text-sm text-brand-ink/70 max-w-md mx-auto leading-relaxed">
          Has finalizado las preguntas del módulo <strong className="text-brand-ink font-semibold">{moduleName}</strong> del simulador Pro Icfes.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
        {/* Success Percentage Card */}
        <div className="bg-brand-bg p-5 rounded-none border border-brand-ink/10 text-center space-y-1">
          <span className="text-[10px] text-brand-ink/50 font-mono uppercase tracking-widest block">Porcentaje Éxito</span>
          <span className={`text-3xl font-display font-bold ${scorePercent >= 60 ? "text-green-700" : "text-brand-accent"}`}>
            {scorePercent}%
          </span>
          <span className="text-[9px] text-brand-ink/40 font-mono uppercase tracking-wider block">Aprobado con ≥60%</span>
        </div>

        {/* Correct Questions */}
        <div className="bg-brand-bg p-5 rounded-none border border-brand-ink/10 text-center space-y-1">
          <span className="text-[10px] text-brand-ink/50 font-mono uppercase tracking-widest block">Respuestas Correctas</span>
          <span className="text-3xl font-display font-bold text-brand-ink">
            {correctCount} <span className="text-sm text-brand-ink/40 font-normal">/ {totalQuestions}</span>
          </span>
          <span className="text-[9px] text-brand-ink/40 font-mono uppercase tracking-wider block">Preguntas superadas</span>
        </div>

        {/* Accumulated Score */}
        <div className="bg-brand-bg p-5 rounded-none border border-brand-ink/10 text-center space-y-1">
          <span className="text-[10px] text-brand-ink/50 font-mono uppercase tracking-widest block">Puntaje Obtenido</span>
          <span className="text-3xl font-display font-bold text-brand-accent">
            {points} <span className="text-sm text-brand-ink/40 font-normal">PTS</span>
          </span>
          <span className="text-[9px] text-brand-ink/40 font-mono uppercase tracking-wider block">10 puntos por acierto</span>
        </div>
      </div>

      {/* Answer Key Review Section */}
      <div className="border-t border-brand-ink/15 pt-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand-ink mb-4">
          Revisión de Preguntas
        </h3>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {questions.map((q, idx) => {
            const selected = userAnswers[q.id_pregunta];
            const correctOption = q.opciones.find((o) => o.es_correcta);
            const isCorrect = selected === correctOption?.letra;

            return (
              <div
                key={q.id_pregunta}
                className={`p-4 rounded-none border flex gap-3 items-start text-left text-sm ${
                  isCorrect
                    ? "bg-green-50/40 border-green-200"
                    : "bg-red-50/40 border-red-200"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isCorrect ? (
                    <div className="w-5 h-5 rounded-none bg-green-600 text-white flex items-center justify-center border border-green-700">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-none bg-red-600 text-white flex items-center justify-center border border-red-700">
                      <X className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex-grow space-y-1">
                  <p className="font-semibold text-brand-ink font-display uppercase text-xs tracking-wide">
                    {idx + 1}. {q.enunciado}
                  </p>
                  <p className="text-xs font-mono text-brand-ink/60 uppercase tracking-wider">
                    Tu respuesta: <strong className={isCorrect ? "text-green-700" : "text-red-700"}>{selected || "Ninguna"}</strong> | Correcta: <strong className="text-green-700">{correctOption?.letra}</strong>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons Block */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-brand-ink/15 justify-between items-center">
        <button
          onClick={onSelectAnotherModule}
          className="w-full sm:w-auto px-5 py-3 bg-brand-bg hover:bg-brand-bg/90 text-brand-ink border border-brand-ink/15 hover:border-brand-ink font-display text-xs font-bold uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-brand-accent" />
          <span>Ver otros Módulos</span>
        </button>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-3 bg-brand-ink hover:bg-brand-ink/90 text-brand-bg font-display text-xs font-bold uppercase tracking-widest rounded-none border border-brand-ink transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-brand-accent" />
          <span>Reiniciar Simulador</span>
        </button>
      </div>
    </motion.div>
  );
}
