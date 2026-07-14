import { CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface FeedbackPanelProps {
  isCorrect: boolean;
  selectedOptionLetra: string;
  correctOptionLetra: string;
  explicacion: string;
}

export default function FeedbackPanel({
  isCorrect,
  selectedOptionLetra,
  correctOptionLetra,
  explicacion,
}: FeedbackPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        p-5 md:p-6 rounded-none border-2 flex flex-col sm:flex-row gap-4 items-start mt-6 shadow-none
        ${isCorrect 
          ? "bg-green-50 border-green-600 text-green-950" 
          : "bg-red-50 border-red-600 text-red-950"
        }
      `}
    >
      {/* Icon Section */}
      <div className="shrink-0 mt-0.5">
        {isCorrect ? (
          <CheckCircle className="w-8 h-8 text-green-600" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-red-600" />
        )}
      </div>

      {/* Text Section */}
      <div className="flex-1 space-y-1">
        <h4 className={`font-display text-base md:text-lg font-bold uppercase tracking-wider ${isCorrect ? "text-green-800" : "text-red-800"}`}>
          {isCorrect ? "¡Correcto!" : "Respuesta Incorrecta"}
        </h4>
        
        {!isCorrect && (
          <p className="text-xs text-red-700 font-mono font-bold uppercase tracking-wide">
            Seleccionaste la opción {selectedOptionLetra}. La respuesta correcta es la {correctOptionLetra}.
          </p>
        )}

        <div className="font-inter text-sm leading-relaxed text-brand-ink pt-1">
          <p className="font-bold inline uppercase font-display text-xs tracking-wider">Explicación: </p>
          <span className="opacity-80">{explicacion}</span>
        </div>
      </div>
    </motion.div>
  );
}
