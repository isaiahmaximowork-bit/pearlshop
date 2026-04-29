import { Check, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type Step = { id: number; title: string; description: string; icon: LucideIcon };

interface Props {
  steps: Step[];
  currentStep: number;
  onStepClick?: (id: number) => void;
}

export function StudioProgressBar({ steps, currentStep, onStepClick }: Props) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="relative">
      {/* Track line */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-border/60 rounded-full mx-12" />
      <motion.div
        initial={false}
        animate={{ width: `calc(${progress}% - 3rem)` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute top-5 left-12 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
      />

      <div className="relative grid grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          const clickable = !!onStepClick && step.id <= currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center text-center">
              <motion.button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(step.id)}
                whileHover={clickable ? { scale: 1.1 } : undefined}
                whileTap={clickable ? { scale: 0.95 } : undefined}
                animate={{ scale: isActive ? 1.05 : 1 }}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 backdrop-blur-md ${clickable ? "cursor-pointer" : "cursor-default"}
                  ${isDone ? "bg-gradient-to-br from-primary to-purple-600 border-transparent text-white shadow-lg shadow-primary/40" : ""}
                  ${isActive ? "bg-gradient-to-br from-primary to-purple-600 border-transparent text-white shadow-lg shadow-primary/50 ring-4 ring-primary/20" : ""}
                  ${!isDone && !isActive ? "bg-card/60 border-border text-muted-foreground" : ""}
                `}
              >
                {isDone ? <Check size={18} /> : <Icon size={18} />}
              </motion.button>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(step.id)}
                className={`mt-2 ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <p className={`text-xs font-bold tracking-tight ${isActive || isDone ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                  {step.description}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
