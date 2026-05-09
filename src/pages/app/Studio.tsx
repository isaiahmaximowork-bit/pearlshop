import { useEffect, useState } from "react";
import { safeStorage } from "@/lib/safari-compat";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Settings2, Wand2, ChevronLeft, ChevronRight, Sparkles, Film, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { StudioStepProduct } from "@/components/studio/StudioStepProduct";
import { StudioStepConfig } from "@/components/studio/StudioStepConfig";
import { StudioStepFinal } from "@/components/studio/StudioStepFinal";
import { StudioStepPrompt } from "@/components/studio/StudioStepPrompt";
import { StudioProgressBar } from "@/components/studio/StudioProgressBar";
import { Button } from "@/components/ui/button";
import type { VideoStyle, VideoFormat, GenerationMode, TakeConfig, CameraMovement } from "@/components/studio/types";

export type StudioState = {
  productId: string | null;
  productName: string | null;
  productDescription: string | null;
  productCategory: string | null;
  productImageUrl: string | null;
  productImages: string[];
  catalogProductId: string | null;
  cameraStyle: string;
  avatarId: string | null;
  avatarCategory: "mulheres" | "homens" | "ia";
  scenarioTags: string[];
  scenarioText: string;
  videoStyle: VideoStyle;
  videoFormat: VideoFormat;
  generationMode: GenerationMode;
  numTakes: 1 | 2 | 3 | 4 | 5;
  takes: TakeConfig[];
  proximity: number;
  energy: number;
  naturalness: number;
  cameraMovement: CameraMovement;
  duration: string;
  voiceGender: string;
  voiceTone: string;
  voiceEnergy: string;
  voiceStyle: string;
  script: string;
  _generatedJob: any;
  _generationProgress: { active: boolean; step: number; total: number; label: string } | null;
  _generatedTakes: any[];
};

const initialState: StudioState = {
  productId: null,
  productName: null,
  productDescription: null,
  productCategory: null,
  productImageUrl: null,
  productImages: [],
  catalogProductId: null,
  cameraStyle: "frente",
  avatarId: null,
  avatarCategory: "mulheres",
  scenarioTags: [],
  scenarioText: "",
  videoStyle: "ugc_autentico",
  videoFormat: "9:16",
  generationMode: "automatico",
  numTakes: 1,
  takes: [],
  proximity: 50,
  energy: 50,
  naturalness: 70,
  cameraMovement: "handheld_suave",
  duration: "1take",
  voiceGender: "feminino",
  voiceTone: "natural",
  voiceEnergy: "media",
  voiceStyle: "conversacional",
  script: "",
  _generatedJob: null,
  _generationProgress: null,
  _generatedTakes: [],
};

const steps = [
  { id: 1, title: "Produto", description: "Escolha o item", icon: Package },
  { id: 2, title: "Configuração", description: "Avatar & cenário", icon: Settings2 },
  { id: 3, title: "Imagem UGC", description: "Configure e gere", icon: Wand2 },
  { id: 4, title: "Prompt Final", description: "Voz e prompt Veo 3", icon: Film },
];

const Studio = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const savedStep = safeStorage.getItem("pearlshop-studio-step");
      return savedStep ? Math.max(1, Math.min(4, parseInt(savedStep))) : 1;
    } catch (e) {
      return 1;
    }
  });
  const [state, setState] = useState<StudioState>(() => {
    try {
      const saved = safeStorage.getItem("pearlshop-studio-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure critical fields are initialized if missing from old saved state
        return { ...initialState, ...parsed };
      }
      return initialState;
    } catch (e) {
      console.error("Error parsing studio state:", e);
      return initialState;
    }
  });

  const updateState = (patch: Partial<StudioState>) => setState((s) => ({ ...s, ...patch }));

  useEffect(() => {
    safeStorage.setItem("pearlshop-studio-state", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    safeStorage.setItem("pearlshop-studio-step", currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const canContinue = () => {
    if (currentStep === 1) return !!state.productId;
    if (currentStep === 2) return !!state.avatarId;
    return true;
  };

  const next = () => setCurrentStep((s) => Math.min(4, s + 1));
  const prev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const resetStepData = () => {
    if (currentStep === 1) {
      updateState(initialState);
      setCurrentStep(1);
      toast.success("Estúdio resetado!");
    } else if (currentStep === 3) {
      updateState({
        _generatedJob: null,
        _generatedTakes: [],
        takes: state.takes.map(t => ({ ...t, imageJob: null, veo3Prompt: null })),
        script: "",
      });
      toast.success("Configurações do Passo 3 resetadas!");
    } else if (currentStep === 4) {
      updateState({
        script: "",
        takes: state.takes.map(t => ({ ...t, veo3Prompt: null })),
      });
      toast.success("Configurações do Passo 4 resetadas!");
    }
  };

  const hasDataToReset = () => {
    if (currentStep === 1) return !!state.productId;
    if (currentStep === 3) {
      return !!state._generatedJob || state._generatedTakes.length > 0 || state.takes.some(t => t.imageJob) || !!state.script;
    }
    if (currentStep === 4) {
      return !!state.script || state.takes.some(t => t.veo3Prompt);
    }
    return false;
  };

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative px-6 pt-8 pb-4 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">PearlShop Studio</h1>
            <p className="text-sm text-muted-foreground">Crie vídeos com IA em 4 passos</p>
          </div>
        </div>
        {(currentStep === 3 || currentStep === 4) && hasDataToReset() && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetStepData}
            className="rounded-xl text-muted-foreground hover:text-red-500 gap-2 transition-colors"
          >
            <RotateCcw size={16} /> Resetar Etapa
          </Button>
        )}
      </div>

      <div className="relative sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <StudioProgressBar steps={steps} currentStep={currentStep} onStepClick={(id) => setCurrentStep(id)} />
        </div>
      </div>

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
            {currentStep === 3 && <StudioStepFinal state={state} updateState={updateState} onAdvance={next} />}
            {currentStep === 4 && <StudioStepPrompt state={state} updateState={updateState} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-background/80 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between md:pl-[19rem]">
          <Button variant="outline" onClick={prev} disabled={currentStep === 1} className="gap-2 rounded-xl">
            <ChevronLeft size={18} /> Voltar
          </Button>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Etapa {currentStep} de {steps.length}
          </span>
          {currentStep < 4 ? (
            <Button onClick={next} disabled={!canContinue()}
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/30">
              Continuar <ChevronRight size={18} />
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Use o botão "Gerar Prompt" acima
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;
