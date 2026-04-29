import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Settings2, Wand2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { StudioStepProduct } from "@/components/studio/StudioStepProduct";
import { StudioStepConfig } from "@/components/studio/StudioStepConfig";
import { StudioStepFinal } from "@/components/studio/StudioStepFinal";
import { StudioProgressBar } from "@/components/studio/StudioProgressBar";
import { Button } from "@/components/ui/button";

export type StudioState = {
  productId: string | null;
  cameraStyle: string;
  avatarId: string | null;
  avatarCategory: "mulheres" | "homens" | "ia";
  scenarioTags: string[];
  scenarioText: string;
  videoStyle: string;
  proximity: number;
  energy: number;
  duration: string;
  voiceGender: string;
  voiceTone: string;
  voiceEnergy: string;
  voiceStyle: string;
  script: string;
};

const initialState: StudioState = {
  productId: null,
  cameraStyle: "frente",
  avatarId: null,
  avatarCategory: "mulheres",
  scenarioTags: [],
  scenarioText: "",
  videoStyle: "ugc",
  proximity: 50,
  energy: 50,
  duration: "1take",
  voiceGender: "feminino",
  voiceTone: "natural",
  voiceEnergy: "media",
  voiceStyle: "conversacional",
  script: "",
};

const steps = [
  { id: 1, title: "Produto", description: "Escolha o item", icon: Package },
  { id: 2, title: "Configuração", description: "Personalize tudo", icon: Settings2 },
  { id: 3, title: "Criação Final", description: "Gere seu vídeo", icon: Wand2 },
];

const Studio = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<StudioState>(initialState);

  const updateState = (patch: Partial<StudioState>) => setState((s) => ({ ...s, ...patch }));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const canContinue = () => {
    if (currentStep === 1) return !!state.productId;
    if (currentStep === 2) return !!state.avatarId;
    return true;
  };

  const next = () => setCurrentStep((s) => Math.min(3, s + 1));
  const prev = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative px-6 pt-8 pb-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">PearlShop Studio</h1>
            <p className="text-sm text-muted-foreground">Crie vídeos com IA em 3 passos</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="relative sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <StudioProgressBar steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-10 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <StudioStepProduct state={state} updateState={updateState} onAdvance={next} />}
            {currentStep === 2 && <StudioStepConfig state={state} updateState={updateState} />}
            {currentStep === 3 && <StudioStepFinal state={state} updateState={updateState} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-background/80 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between md:pl-[19rem]">
          <Button
            variant="outline"
            onClick={prev}
            disabled={currentStep === 1}
            className="gap-2 rounded-xl"
          >
            <ChevronLeft size={18} /> Voltar
          </Button>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Etapa {currentStep} de {steps.length}
          </span>
          {currentStep < 3 ? (
            <Button
              onClick={next}
              disabled={!canContinue()}
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/30"
            >
              Continuar <ChevronRight size={18} />
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Use o botão "Gerar vídeo" acima
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;
