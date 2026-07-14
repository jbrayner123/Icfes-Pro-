import { Question, Option } from "../types";
import { Check, X, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface QuestionCardProps {
  question: Question;
  selectedOptionLetra: string | undefined;
  onSelectOption: (option: Option) => void;
  isAnswered: boolean;
}

export default function QuestionCard({
  question,
  selectedOptionLetra,
  onSelectOption,
  isAnswered,
}: QuestionCardProps) {
  // Letters mapped to indices
  const getLetterByIndex = (index: number) => {
    return ["A", "B", "C", "D"][index] || String.fromCharCode(65 + index);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Question Enunciado */}
      <div className="bg-white p-5 rounded-none border border-brand-ink/15 shadow-none">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-brand-accent shrink-0 mt-1" />
          <h3 className="font-display font-bold text-base md:text-lg text-brand-ink leading-relaxed tracking-wide">
            {question.enunciado}
          </h3>
        </div>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-3">
        {question.opciones.map((option, index) => {
          const letter = option.letra || getLetterByIndex(index);
          const isCurrentSelected = selectedOptionLetra === letter;
          const isCurrentCorrect = option.es_correcta;

          let optionStyle = "border-brand-ink/15 bg-white hover:bg-brand-bg hover:border-brand-ink cursor-pointer";
          let badgeStyle = "border-brand-ink/10 text-brand-ink/60 bg-brand-bg";
          let textStyle = "text-brand-ink";

          // If the question has been answered
          if (isAnswered) {
            if (isCurrentCorrect) {
              // Highlight correct option in green brutalist style
              optionStyle = "border-green-600 bg-green-50/70 text-green-950 border-2";
              badgeStyle = "bg-green-600 text-white border-green-700";
              textStyle = "text-green-950 font-bold";
            } else if (isCurrentSelected && !isCurrentCorrect) {
              // Highlight selected incorrect option in red brutalist style
              optionStyle = "border-red-600 bg-red-50/70 text-red-950 border-2";
              badgeStyle = "bg-red-600 text-white border-red-700";
              textStyle = "text-red-950 font-bold";
            } else {
              // Non-selected incorrect options are faded out
              optionStyle = "border-brand-ink/5 bg-brand-bg/40 opacity-40 cursor-not-allowed";
              badgeStyle = "border-brand-ink/5 text-brand-ink/30 bg-brand-bg/20";
              textStyle = "text-brand-ink/40";
            }
          } else if (isCurrentSelected) {
            optionStyle = "border-brand-ink bg-brand-bg border-2";
            badgeStyle = "bg-brand-ink text-brand-bg border-brand-ink";
            textStyle = "text-brand-ink font-bold";
          }

          return (
            <motion.button
              key={letter}
              disabled={isAnswered}
              onClick={() => onSelectOption(option)}
              whileHover={isAnswered ? {} : { x: 2 }}
              whileTap={isAnswered ? {} : { scale: 0.995 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={`
                w-full text-left p-4 rounded-none border transition-all duration-150 flex items-start gap-4 focus:outline-none
                ${optionStyle}
              `}
            >
              {/* Option Letter Bubble / Icon */}
              <div className="shrink-0 mt-0.5">
                {isAnswered && isCurrentCorrect ? (
                  <div className="w-7 h-7 rounded-none bg-green-600 text-white flex items-center justify-center border border-green-700">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : isAnswered && isCurrentSelected && !isCurrentCorrect ? (
                  <div className="w-7 h-7 rounded-none bg-red-600 text-white flex items-center justify-center border border-red-700">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-none border flex items-center justify-center font-display font-bold text-xs tracking-wide transition-colors duration-150 ${badgeStyle}`}>
                    {letter}
                  </div>
                )}
              </div>

              {/* Option Text */}
              <div className="flex-1 pt-0.5">
                <p className={`font-inter text-sm md:text-base leading-relaxed ${textStyle}`}>
                  {option.texto}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
