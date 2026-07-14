import { motion } from "motion/react";

interface HeaderProgressProps {
  moduleName: string;
  currentQuestionIndex: number; // 0-based index
  totalQuestions: number;
}

export default function HeaderProgress({
  moduleName,
  currentQuestionIndex,
  totalQuestions,
}: HeaderProgressProps) {
  // Compute progress percentage
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentQuestionIndex + 1) / totalQuestions) * 100)
  );

  return (
    <header className="mb-6 border-b border-brand-ink/15 pb-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="font-mono text-[9px] text-brand-bg bg-brand-ink px-2 py-0.5 border border-brand-ink font-bold uppercase tracking-widest mb-1.5 inline-block">
            Módulo Académico
          </span>
          <h1 className="font-display text-xl md:text-2xl font-bold text-brand-ink tracking-tight uppercase">
            {moduleName}
          </h1>
        </div>
        <div className="text-right">
          <span className="font-display text-[10px] text-brand-ink/60 font-bold tracking-widest block uppercase">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </span>
          <span className="font-mono text-[10px] text-brand-accent font-bold uppercase tracking-wider">
            {Math.round(progressPercent)}% Completado
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-1.5 bg-brand-ink/10 mt-3 rounded-none overflow-hidden">
        {/* Animated Progress Fill */}
        <motion.div
          className="h-full bg-brand-ink rounded-none"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </header>
  );
}
