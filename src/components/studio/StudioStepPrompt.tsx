import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wand2, Copy, ChevronDown, ExternalLink, Sparkles,
  Loader2, Download, X, Rocket, Film, Megaphone, ThumbsUp, BookOpen,
  FolderOpen, HelpCircle, Camera, Zap, Music, Eye, Smartphone, Hand,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { glassCard } from "./glass";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { StudioState } from "@/pages/app/Studio";
import { findAvatar } from "./avatars";
import type { VideoStyle } from "./types";
import { defaultTake } from "./types";

const voiceOptions = {
  voiceGender: { label: "Gênero", options: ["feminino", "masculino"] },
  voiceTone: { label: "Tom de Voz", options: ["natural", "expressivo", "calmo", "intenso"] },
  voiceEnergy: { label: "Energia", options: ["baixa", "media", "alta"] },
  voiceStyle: { label: "Estilo", options: ["conversacional", "narrativo", "publicitario"] },
};

const videoStyles: { id: VideoStyle; label: string; desc: string; icon: any }[] = [
  { id: "ugc_autentico", label: "UGC Autêntico", desc: "Estilo natural, gravação caseira", icon: Camera },
  { id: "publicitario", label: "Publicitário", desc: "Visual polido e cinematográfico", icon: Sparkles },
  { id: "viral_tiktok", label: "Viral TikTok", desc: "Cortes rápidos, dinâmico", icon: Zap },
  { id: "dancinha", label: "Dancinha", desc: "Movimentos rítmicos com produto", icon: Music },
  { id: "close_up", label: "Close-up", desc: "Expressões faciais íntimas", icon: Eye },
  { id: "mirror_selfie", label: "Mirror Selfie", desc: "Reveal de outfit no espelho", icon: Smartphone },
  { id: "hook_mao_camera", label: "Hook Mão", desc: "Dedo na câmera → reveal", icon: Hand },
];

const CATEGORY_VIDEOSTYLE_VISIBILITY: Record<string, VideoStyle[]> = {
  clothing: ["ugc_autentico", "publicitario", "viral_tiktok", "dancinha", "close_up", "mirror_selfie", "hook_mao_camera"],
  footwear: ["ugc_autentico", "publicitario", "viral_tiktok", "close_up", "hook_mao_camera"],
  accessories: ["ugc_autentico", "publicitario", "viral_tiktok", "close_up", "hook_mao_camera"],
  beauty: ["ugc_autentico", "publicitario", "viral_tiktok", "close_up", "mirror_selfie", "hook_mao_camera"],
  electronics: ["ugc_autentico", "publicitario", "viral_tiktok", "close_up", "hook_mao_camera"],
  home: ["ugc_autentico", "publicitario", "viral_tiktok", "close_up"],
  food_beverage: ["ugc_autentico", "publicitario", "viral_tiktok", "close_up"],
  fitness: ["ugc_autentico", "publicitario", "viral_tiktok", "dancinha", "close_up", "mirror_selfie"],
};

const scriptTemplates = [
  { id: "promocional", icon: Megaphone, title: "Promocional", desc: "Promovendo o produto com oferta e CTA forte" },
  { id: "indicacional", icon: ThumbsUp, title: "Indicacional", desc: "Indicação autêntica de quem já usa" },
  { id: "storytelling", icon: BookOpen, title: "Storytelling", desc: "História pessoal conectando com o produto" },
];

const durations = [
  { id: "1take", takes: 1 }, { id: "2takes", takes: 2 }, { id: "3takes", takes: 3 },
  { id: "4takes", takes: 4 }, { id: "5takes", takes: 5 },
];

interface Props {
  state: StudioState;
  updateState: (patch: Partial<StudioState>) => void;
}

export function StudioStepPrompt({ state, updateState }: Props) {
  const navigate = useNavigate();
  const [scriptLoading, setScriptLoading] = useState<string | null>(null);
  const [veo3Loading, setVeo3Loading] = useState(false);
  const [veo3Stage, setVeo3Stage] = useState<"idle" | "analyzing" | "generating">("idle");
  const [veo3Prompt, setVeo3Prompt] = useState<string | null>(null);
  const [veo3Analysis, setVeo3Analysis] = useState<any>(null);
  const [veo3Metadata, setVeo3Metadata] = useState<any>(null);
  const [veo3Prompts, setVeo3Prompts] = useState<string[]>([]);
  const [activePromptTab, setActivePromptTab] = useState(0);
  const [promptGenerated, setPromptGenerated] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [voiceWarningOpen, setSuccessWarningOpen] = useState<{ open: boolean; onConfirm: () => void } | null>(null);

  const avatar = findAvatar(state.avatarId);
  const numTakes = durations.find((d) => d.id === state.duration)?.takes || 1;
  const wordCount = state.script.trim() ? state.script.trim().split(/\s+/).length : 0;

  // Check if there's a generated job (image) from step 3
  const generatedJob = state._generatedJob as any;
  const generatedTakes = (state.takes || []).map((t) => t.imageJob).filter(Boolean);
  const progress = state._generationProgress;

  const detectScriptType = (text: string): "promocional" | "indicacional" | "storytelling" => {
    const t = text.toLowerCase();
    if (/(deixa eu te contar|aconteceu|eu vivia|semana passada|antes eu)/.test(t)) return "storytelling";
    if (/(corre|promo|link na bio|antes que acabe|aproveita|garante o seu)/.test(t)) return "promocional";
    if (/(indic|recomend|de verdade|vale a pena|olha que)/.test(t)) return "indicacional";
    return "promocional";
  };

  const handleGenerateScriptAI = async (type: "promocional" | "indicacional" | "storytelling", title: string, takeIndex?: number) => {
    if (scriptLoading) return;
    setScriptLoading(type);
    const toastId = toast.loading(`Gerando roteiro ${title}...`);
    try {
      const { data, error } = await supabase.functions.invoke("generate-script", {
        body: {
          scriptType: type, productId: state.productId, catalogProductId: state.catalogProductId,
          productName: state.productName, productDescription: state.productDescription,
          productCategory: state.productCategory, voiceGender: state.voiceGender,
          voiceTone: state.voiceTone, voiceEnergy: state.voiceEnergy, voiceStyle: state.voiceStyle,
          duration: takeIndex !== undefined ? "1take" : state.duration, videoStyle: state.videoStyle, numTakes: takeIndex !== undefined ? 1 : numTakes,
          isSingleTake: takeIndex !== undefined,
        },
      });
      if (error) throw error;
      if (!data?.success) {
        if (data?.errorCode === "AI_CREDITS_EXHAUSTED") { toast.error("Créditos do Gemini esgotados.", { id: toastId }); return; }
        if (data?.errorCode === "RATE_LIMIT") { toast.error("Muitas requisições. Aguarde alguns segundos.", { id: toastId }); return; }
        if (data?.errorCode === "MODEL_OVERLOADED") { toast.error("Gemini sobrecarregado. Tente em 1-2 min.", { id: toastId }); return; }
        throw new Error(data?.error || "Falha ao gerar roteiro");
      }
      if (takeIndex !== undefined) {
        const nextTakes = [...state.takes];
        if (!nextTakes[takeIndex]) nextTakes[takeIndex] = defaultTake(takeIndex + 1);
        nextTakes[takeIndex] = { ...nextTakes[takeIndex], dialogue: data.script };
        updateState({ takes: nextTakes });
      } else {
        updateState({ script: data.script });
      }
      toast.success(`Roteiro ${title} pronto!`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar roteiro", { id: toastId });
    } finally {
      setScriptLoading(null);
    }
  };

  const handleGenerateVeo3Prompt = async () => {
    console.log("[StudioStepPrompt] handleGenerateVeo3Prompt called");
    console.log("[StudioStepPrompt] generatedJob:", JSON.stringify(generatedJob));
    console.log("[StudioStepPrompt] state._generatedJob:", JSON.stringify(state._generatedJob));
    console.log("[StudioStepPrompt] script:", state.script?.substring(0, 50));
    console.log("[StudioStepPrompt] takes dialogues:", state.takes.map(t => t.dialogue?.substring(0, 30)));
    
    // Ensure we have an image job. In multi-take mode, each take has its own imageJob.
    // In single take mode, we might use state._generatedJob.
    const hasImage = (generatedJob && generatedJob.image_url) || (generatedTakes && generatedTakes.length > 0);
    
    if (!hasImage) { 
      toast.error("Gere a imagem UGC na etapa anterior primeiro"); 
      return; 
    }

    const hasRoteiro = state.script.trim() || state.takes.some((t) => t.dialogue?.trim());
    if (!hasRoteiro) { 
      toast.error("Escreva ou gere o roteiro antes"); 
      return; 
    }

    if (veo3Loading) return;

    setVeo3Loading(true);
    setVeo3Stage("analyzing");
    const toastId = toast.loading("Analisando imagem UGC...");

    try {
      // Logic for multi-take or single-take unified
      const takesToProcess = state.takes.length > 0 ? state.takes : [{ ...defaultTake(1), imageJob: generatedJob, dialogue: state.script }];
      
      const prompts: string[] = [];
      const nextTakes = [...state.takes];
      
      for (let i = 0; i < takesToProcess.length; i++) {
        const currentTake = takesToProcess[i];
        const job = currentTake.imageJob || (i === 0 ? generatedJob : null);
        
        if (!job || !job.image_url) {
          console.warn(`[StudioStepPrompt] Skipping take ${i + 1} - no image job found`);
          continue;
        }

        const takeScript = currentTake.dialogue?.trim() || state.script.trim();
        toast.loading(`Analisando take ${i + 1}...`, { id: toastId });
        
        const analyzeRes = await supabase.functions.invoke("analyze-ugc-image", {
          body: { 
            jobId: job.id, 
            ugcImageUrl: job.image_url, 
            productName: state.productName, 
            productDescription: state.productDescription, 
            productCategory: state.productCategory, 
            avatarName: avatar?.name || state.avatarId 
          },
        });
        
        if (analyzeRes.error) throw analyzeRes.error;
        const analyzeData: any = analyzeRes.data;
        if (!analyzeData?.success) throw new Error(analyzeData?.error || `Falha ao analisar take ${i + 1}`);
        
        toast.loading(`Gerando prompt do take ${i + 1}...`, { id: toastId });
        const scriptType = detectScriptType(takeScript);
        
        const promptRes = await supabase.functions.invoke("generate-veo3-prompt", {
          body: {
            jobId: job.id, 
            ugcImageUrl: job.image_url, 
            analysisReport: analyzeData.report, 
            script: takeScript, 
            scriptType,
            videoStyle: currentTake.videoStyle || state.videoStyle, 
            videoFormat: state.videoFormat,
            numTakes: 1, 
            takes: [currentTake],
            voice: { 
              gender: currentTake.voiceGender || state.voiceGender, 
              tone: currentTake.voiceTone || state.voiceTone, 
              energy: currentTake.voiceEnergy || state.voiceEnergy, 
              style: currentTake.voiceStyle || state.voiceStyle 
            },
            product: { 
              name: state.productName, 
              description: state.productDescription, 
              category: state.productCategory 
            },
            avatar: { name: avatar?.name || state.avatarId },
          },
        });
        
        if (promptRes.error) throw promptRes.error;
        const promptData: any = promptRes.data;
        if (!promptData?.success) throw new Error(promptData?.error || `Falha ao gerar prompt do take ${i + 1}`);
        
        prompts.push(promptData.veo3Prompt);
        if (nextTakes[i]) {
          nextTakes[i] = { ...nextTakes[i], veo3Prompt: promptData.veo3Prompt };
        }
      }
      
      if (prompts.length === 0) {
        throw new Error("Nenhum prompt foi gerado. Verifique se as imagens foram criadas.");
      }

      setVeo3Prompts(prompts);
      setVeo3Prompt(prompts[0]);
      // Note: We don't save the veo3Prompt back to the state here anymore as requested, 
      // but we need it for the UI/clipboard. 
      // If we want it to NOT persist, we just don't call updateState with prompts.
      // However, the user said "saves in library and it's done", but here it's prompts.
      // For now, let's keep it in local state only for this step session if they want it not to persist in the main state.
      // But they specifically said "sistema nao salve ali a foto, e as configuracoes".
      setPromptGenerated(true);
      setManualOpen(true);
      
      const clipboardText = prompts.length > 1 
        ? prompts.map((p, i) => `--- TAKE ${i + 1} ---\n${p}`).join("\n\n")
        : prompts[0];
        
      navigator.clipboard.writeText(clipboardText).catch(() => {});
      fireConfetti();
      toast.success(prompts.length > 1 ? "Prompts por take gerados e copiados!" : "Prompt Veo 3 gerado e copiado!", { id: toastId });
    } catch (err: any) {
      console.error("[StudioStepPrompt] Veo3 prompt error:", err);
      console.error("[StudioStepPrompt] Error details:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      toast.error(err?.message || "Erro ao gerar prompt Veo 3", { id: toastId });
    } finally {
      setVeo3Loading(false);
      setVeo3Stage("idle");
    }
  };

  const fireConfetti = () => {
    const end = Date.now() + 2000;
    const colors = ["#a855f7", "#7c3aed", "#c084fc", "#ffffff"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const previewAspect = state.videoFormat === "16:9" ? "aspect-[16/9] w-80"
    : state.videoFormat === "1:1" ? "aspect-square w-56"
    : state.videoFormat === "3:4" ? "aspect-[3/4] w-48"
    : "aspect-[9/16] w-56";

  const productCategory = (state.productCategory || "").toLowerCase();
  const visibleVideoStyleIds = CATEGORY_VIDEOSTYLE_VISIBILITY[productCategory] || videoStyles.map(v => v.id);
  const visibleVideoStyles = videoStyles.filter(v => visibleVideoStyleIds.includes(v.id));

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Prompt Final</h2>
        <p className="text-muted-foreground">Configure o estilo, voz, roteiro e gere o prompt para o Veo 3.</p>
      </div>

      {/* Estilo do Vídeo - Visível se numTakes=1 ou se estiver em modo Manual com >1 takes */}
      {(numTakes === 1 || (numTakes > 1 && state.generationMode === "manual")) && (
        <div className={`${glassCard} p-6`}>
          <div className="flex items-center gap-2 mb-1">
            <Camera size={18} className="text-primary" />
            <h3 className="font-bold tracking-tight">Estilo do Vídeo</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Tom geral da produção que a IA deve seguir</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {visibleVideoStyles.map((v) => {
              const Icon = v.icon;
              const sel = state.videoStyle === v.id;
              return (
                <div key={v.id} onClick={() => updateState({ videoStyle: v.id })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    sel ? "bg-primary/10 border-primary ring-1 ring-primary shadow-lg shadow-primary/20"
                      : "bg-card/40 border-border/60 hover:border-primary/40 hover:bg-card/60"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    sel ? "bg-gradient-to-br from-primary to-purple-600 text-white" : "bg-accent"
                  }`}><Icon size={18} /></div>
                  <p className="font-bold text-sm">{v.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {progress?.active && (
        <div className={`${glassCard} p-6 text-center`}>
          <Loader2 size={34} className="mx-auto text-primary animate-spin mb-4" />
          <p className="font-black tracking-tight mb-2">{progress.label}</p>
          <div className="h-2 rounded-full bg-border/60 overflow-hidden mb-2">
            <motion.div className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full"
              animate={{ width: `${Math.min(100, (progress.step / progress.total) * 100)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{progress.step} de {progress.total}</p>
        </div>
      )}

      {/* UGC Preview */}
      {(generatedTakes.length > 1 || generatedJob?.image_url) && (
        <div className={`${glassCard} p-6`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            {generatedTakes.length > 1 ? "Imagens UGC Geradas" : "Imagem UGC Gerada"}
          </p>
          <div className="flex justify-center gap-3 overflow-x-auto pb-1">
            {(generatedTakes.length > 1 ? generatedTakes : [generatedJob]).map((job: any, i: number) => (
              <div key={job.id || i} className={`relative ${previewAspect} shrink-0 rounded-2xl overflow-hidden border border-border/60 shadow-xl`}>
                <img src={job.image_url} alt={`UGC take ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-md border border-border/60 text-[9px] font-bold flex items-center gap-1">
                  <Sparkles size={9} className="text-primary" /> Take {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuração de Voz - Hidden if >1 take (now per-take) or automatico */}
      {numTakes === 1 && state.generationMode !== "automatico" && (
        <div className={`${glassCard} p-6`}>
          <h3 className="font-bold tracking-tight mb-4">Configuração de Voz</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(Object.entries(voiceOptions) as [keyof typeof voiceOptions, { label: string; options: string[] }][]).map(([key, cfg]) => (
              <div key={key}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{cfg.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cfg.options.map((opt) => {
                    const sel = (state as any)[key] === opt;
                    return (
                      <button key={opt} onClick={() => {
                        updateState({ [key]: opt } as any);
                      }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                          sel ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/30"
                            : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                        }`}>{opt}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diálogo - Hidden if >1 take (now using per-take config) or automatico */}
      {numTakes === 1 && !(numTakes > 1 && state.generationMode === "automatico") && (
        <div className={`${glassCard} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold tracking-tight">Diálogo (Roteiro)</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl gap-2" disabled={!!scriptLoading}>
                  {scriptLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  {scriptLoading ? "Gerando..." : "Preencher com IA"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-xl">
                {scriptTemplates.map((tpl) => {
                  const Icon = tpl.icon;
                  const isLoading = scriptLoading === tpl.id;
                  return (
                    <DropdownMenuItem key={tpl.id}
                      onClick={(e) => { e.preventDefault(); handleGenerateScriptAI(tpl.id as any, tpl.title); }}
                      disabled={!!scriptLoading} className="gap-3 py-2.5 cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                        {isLoading ? <Loader2 size={16} className="text-primary animate-spin" /> : <Icon size={16} className="text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{tpl.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{tpl.desc}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Textarea value={state.script} onChange={(e) => updateState({ script: e.target.value })}
            placeholder="Escreva o roteiro do vídeo aqui..." className="min-h-[140px] rounded-xl resize-none" />
          <div className="flex justify-between mt-2">
            <p className="text-[10px] text-muted-foreground">Máx. {numTakes * 20} palavras ({numTakes} take{numTakes > 1 ? "s" : ""} × 20)</p>
            <p className={`text-[10px] ${wordCount > numTakes * 20 ? "text-red-400" : "text-muted-foreground"}`}>{wordCount} palavras</p>
          </div>
        </div>
      )}

      {/* Multi-take Voice & Script Configuration */}
      {numTakes > 1 && state.generationMode !== "automatico" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Film size={18} className="text-primary" />
            <h3 className="font-bold tracking-tight text-lg">Configuração por Take</h3>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: numTakes }).map((_, i) => (
              <TakePromptAccordion 
                key={i}
                index={i}
                state={state}
                updateState={updateState}
                onVoiceChange={(key, val) => {
                  const applyChange = () => {
                    if (i === 0) {
                      // Apply to all: first update global state
                      updateState({ [key]: val } as any);
                      // Then update all takes to maintain UI consistency if they had overrides
                      const nextTakes = state.takes.map(t => ({ ...t, [key]: val }));
                      updateState({ takes: nextTakes });
                    } else {
                      // Only to this take
                      const nextTakes = [...state.takes];
                      if (!nextTakes[i]) nextTakes[i] = defaultTake(i + 1);
                      nextTakes[i] = { ...nextTakes[i], [key]: val };
                      updateState({ takes: nextTakes });
                    }
                  };

                  if (i > 0) {
                    setSuccessWarningOpen({
                      open: true,
                      onConfirm: applyChange
                    });
                  } else {
                    applyChange();
                  }
                }}
                handleGenerateScriptAI={handleGenerateScriptAI}
                scriptLoading={scriptLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Voice Warning Dialog */}
      <Dialog open={!!voiceWarningOpen?.open} onOpenChange={(open) => !open && setSuccessWarningOpen(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <HelpCircle size={24} className="text-yellow-600" />
              </div>
              <h3 className="font-bold text-xl">Aviso de Voz</h3>
              <p className="text-muted-foreground text-sm">
                Ao alterar as configurações de voz em um take individual (que não seja o primeiro), 
                a inteligência artificial pode gerar uma voz com características diferentes das cenas anteriores.
              </p>
              <p className="text-sm font-semibold">Deseja continuar mesmo assim?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setSuccessWarningOpen(null)}>
                Cancelar
              </Button>
              <Button className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90" onClick={() => {
                voiceWarningOpen?.onConfirm();
                setSuccessWarningOpen(null);
              }}>
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gerar Prompt Veo 3 */}
      <div className={`${glassCard} p-6 relative overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
        <div className="relative">
          <h3 className="font-bold tracking-tight mb-1">Gerar Prompt de Vídeo (Veo 3)</h3>
          <p className="text-xs text-muted-foreground mb-4">
            A IA analisa a imagem UGC e gera prompt(s) técnico(s) AAA em inglês — um por take.
          </p>
          {!generatedJob?.image_url && (
            <div className="mb-3 px-3 py-2 rounded-xl border border-dashed border-border/60 text-[11px] text-muted-foreground text-center">
              Gere a imagem UGC na etapa anterior primeiro.
            </div>
          )}
          <button onClick={handleGenerateVeo3Prompt}
            disabled={veo3Loading || !generatedJob?.image_url || !state.script.trim()}
            className="group relative w-full h-14 rounded-xl overflow-hidden font-bold text-base text-white shadow-lg shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--primary)),#9333ea,#c084fc,#9333ea,hsl(var(--primary)))] bg-[length:300%_100%] animate-[shimmer_3s_linear_infinite]" />
            <span className="absolute -inset-1 rounded-xl bg-primary/40 blur-xl opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <span className="relative flex items-center justify-center gap-2">
              {veo3Loading ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
              {veo3Stage === "analyzing" ? "Analisando imagem..."
                : veo3Stage === "generating" ? "Gerando prompt(s)..."
                : veo3Prompt ? "Regerar Prompt(s) Veo 3" : "Gerar Prompt de Vídeo"}
            </span>
          </button>

          {/* Análise */}
          <AnimatePresence>
            {veo3Analysis && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="mt-4 p-4 rounded-xl bg-card/60 border border-border/60">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Análise da imagem</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      {veo3Analysis.qualityScore?.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  {[["Avatar", veo3Analysis.avatarConsistency], ["Produto", veo3Analysis.productVisibility],
                    ["Luz", veo3Analysis.lightingQuality], ["Qualidade", veo3Analysis.overallQuality],
                    ["Movim.", veo3Analysis.movementPotential]].map(([label, val]: any) => (
                    <div key={label} className="py-1.5 rounded-lg bg-background/40 border border-border/40">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
                      <p className="text-sm font-bold">{Number(val).toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {veo3Prompt && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-primary text-center mt-3 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles size={12} /> Prompt(s) Veo 3 copiado(s)! Cole no Flow + use a imagem UGC como seed.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Prompt output */}
      {promptGenerated && (
        <div id="manual-prompt" className={`${glassCard} overflow-hidden`}>
          <button onClick={() => setManualOpen((o) => !o)}
            className="w-full flex items-center justify-between p-5 hover:bg-accent/30 transition-colors">
            <div className="text-left">
              <h3 className="font-bold tracking-tight">
                {veo3Prompts.length > 1 ? `Prompts Veo 3 (${veo3Prompts.length} Takes)` : "Prompt Veo 3 (Inglês)"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Cole no Flow / Veo 3 e use a imagem UGC como seed.</p>
            </div>
            <motion.div animate={{ rotate: manualOpen ? 180 : 0 }}><ChevronDown size={18} className="text-muted-foreground" /></motion.div>
          </button>
          <AnimatePresence>
            {manualOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="px-5 pb-6 space-y-3">
                  {veo3Prompts.length > 1 && (
                    <div className="flex gap-1 mb-2">
                      {veo3Prompts.map((_, i) => (
                        <button key={i} onClick={() => setActivePromptTab(i)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activePromptTab === i ? "bg-primary text-white" : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                          }`}>Take {i + 1}</button>
                      ))}
                      <button onClick={() => {
                        navigator.clipboard.writeText(veo3Prompts.map((p, i) => `--- TAKE ${i + 1} ---\n${p}`).join("\n\n"));
                        toast.success("Todos os prompts copiados!");
                      }} className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <Copy size={12} /> Copiar Todos
                      </button>
                    </div>
                  )}
                  <Textarea readOnly value={veo3Prompts[activePromptTab] || veo3Prompt || ""}
                    className="min-h-[140px] rounded-xl bg-background/60 font-mono text-xs" />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => {
                      const text = veo3Prompts.length > 1 ? veo3Prompts[activePromptTab] : (veo3Prompt || "");
                      navigator.clipboard.writeText(text);
                      toast.success(`Prompt${veo3Prompts.length > 1 ? ` Take ${activePromptTab + 1}` : ""} copiado!`);
                    }} className="rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600">
                      <Copy size={14} /> {veo3Prompts.length > 1 ? `Copiar Take ${activePromptTab + 1}` : "Copiar Prompt"}
                    </Button>
                    <Button variant="outline" size="sm" asChild className="rounded-xl gap-2">
                      <a href="https://gemini.google.com" target="_blank" rel="noreferrer"><ExternalLink size={14} /> Abrir Gemini</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="rounded-xl gap-2">
                      <a href="https://labs.google/flow" target="_blank" rel="noreferrer"><ExternalLink size={14} /> Abrir Flow</a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Success */}
      {veo3Prompt && (
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate("/app/historico")} className="rounded-xl gap-2 h-12">
            <FolderOpen size={16} /> Biblioteca
          </Button>
          <Button asChild className="h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/40 gap-2 font-bold">
            <a href="https://labs.google/flow" target="_blank" rel="noreferrer"><Rocket size={16} /> Abrir Flow</a>
          </Button>
        </div>
      )}
    </div>
  );
}

function TakePromptAccordion({ 
  index, 
  state, 
  updateState, 
  onVoiceChange, 
  handleGenerateScriptAI, 
  scriptLoading 
}: { 
  index: number; 
  state: StudioState; 
  updateState: (patch: Partial<StudioState>) => void; 
  onVoiceChange: (key: string, val: string) => void;
  handleGenerateScriptAI: (type: any, title: string, index?: number) => Promise<void>;
  scriptLoading: string | null;
}) {
  const [open, setOpen] = useState(index === 0);
  const take = state.takes[index] || defaultTake(index + 1);
  
  // Voice settings prioritize take-specific, fall back to global
  const currentVoice = {
    voiceGender: take.voiceGender || state.voiceGender,
    voiceTone: take.voiceTone || state.voiceTone,
    voiceEnergy: take.voiceEnergy || state.voiceEnergy,
    voiceStyle: take.voiceStyle || state.voiceStyle,
  };

  const updateTakeScript = (val: string) => {
    const nextTakes = [...state.takes];
    if (!nextTakes[index]) nextTakes[index] = defaultTake(index + 1);
    nextTakes[index] = { ...nextTakes[index], dialogue: val };
    updateState({ takes: nextTakes });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/20 transition-colors">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-bold">Take {index + 1}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-1">
              {take.dialogue || "Sem roteiro definido"}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={18} className="text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-4 pb-5 space-y-5">
              {/* Voice Config for this Take */}
              <div className="pt-2 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Film size={10} /> Configuração de Voz {index === 0 && "(Mestra)"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(voiceOptions) as [keyof typeof voiceOptions, { label: string; options: string[] }][]).map(([key, cfg]) => (
                    <div key={key}>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{cfg.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {cfg.options.map((opt) => {
                          const sel = (currentVoice as any)[key] === opt;
                          return (
                            <button key={opt} onClick={() => onVoiceChange(key, opt)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize transition-all ${
                                sel ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md"
                                  : "bg-background/60 border border-border/60 text-muted-foreground hover:text-foreground"
                              }`}>{opt}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {index === 0 && (
                  <p className="text-[9px] text-muted-foreground italic">
                    * Alterações no Take 1 são replicadas para todos os outros takes.
                  </p>
                )}
              </div>

              {/* Script for this Take */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Diálogo (Roteiro)</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 rounded-lg gap-1.5 text-[10px]" disabled={!!scriptLoading}>
                        {scriptLoading ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                        Gerar com IA
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-xl">
                      {scriptTemplates.map((tpl) => {
                        const Icon = tpl.icon;
                        return (
                          <DropdownMenuItem key={tpl.id}
                            onClick={async (e) => { 
                              e.preventDefault(); 
                              // Use existing logic but it might need adaptation for per-take script generation
                              // For now, let's keep it simple
                              handleGenerateScriptAI(tpl.id as any, tpl.title, index); 
                            }}
                            className="gap-3 py-2 cursor-pointer">
                            <Icon size={14} className="text-primary" />
                            <div>
                              <p className="text-xs font-bold">{tpl.title}</p>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Textarea 
                  value={take.dialogue} 
                  onChange={(e) => updateTakeScript(e.target.value)}
                  placeholder="Roteiro específico para este take..." 
                  className="min-h-[100px] rounded-xl resize-none text-xs bg-background/40" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}