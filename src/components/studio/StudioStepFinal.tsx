import { useState } from "react";
import {
  Sparkles, Loader2, Camera, Zap, Eye, Hand, Smartphone, Music,
  MonitorSmartphone, Ratio, ToggleLeft, ToggleRight, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { glassCard, glassSelectable } from "./glass";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { StudioState } from "@/pages/app/Studio";
import { findAvatar } from "./avatars";
import type {
  VideoStyle, VideoFormat, GenerationMode, TakeConfig,
  SceneType, CameraAngle, LightingType,
} from "./types";
import { defaultTake } from "./types";
import camFrente from "@/assets/camera/frente.webp";
import camPov from "@/assets/camera/pov.webp";
import camDemo from "@/assets/camera/demo.webp";

// === Constants ===
const cameraStyles = [
  { id: "frente", label: "De Frente", desc: "Avatar olhando para câmera", img: camFrente },
  { id: "pov", label: "Mãos (POV)", desc: "Vista em primeira pessoa", img: camPov },
  { id: "demo", label: "Demonstração", desc: "Foco no produto em uso", img: camDemo },
];

const videoStyles: { id: VideoStyle; label: string; desc: string; icon: any }[] = [
  { id: "ugc_autentico", label: "UGC Autêntico", desc: "Estilo natural, gravação caseira", icon: Camera },
  { id: "publicitario", label: "Publicitário", desc: "Visual polido e cinematográfico", icon: Sparkles },
  { id: "viral_tiktok", label: "Viral TikTok", desc: "Cortes rápidos, dinâmico", icon: Zap },
  { id: "dancinha", label: "Dancinha", desc: "Movimentos rítmicos com produto", icon: Music },
  { id: "close_up", label: "Close-up", desc: "Expressões faciais íntimas", icon: Eye },
  { id: "mirror_selfie", label: "Mirror Selfie", desc: "Reveal de outfit no espelho", icon: Smartphone },
  { id: "hook_mao_camera", label: "Hook Mão", desc: "Dedo na câmera → reveal", icon: Hand },
];

const videoFormats: { id: VideoFormat; label: string; desc: string }[] = [
  { id: "9:16", label: "9:16", desc: "TikTok / Reels" },
  { id: "16:9", label: "16:9", desc: "YouTube" },
  { id: "3:4", label: "3:4", desc: "Feed" },
  { id: "1:1", label: "1:1", desc: "Quadrado" },
];

const durations = [
  { id: "1take", label: "1 Take", sub: "8s", takes: 1 },
  { id: "2takes", label: "2 Takes", sub: "16s", takes: 2 },
  { id: "3takes", label: "3 Takes", sub: "24s", takes: 3 },
  { id: "4takes", label: "4 Takes", sub: "32s", takes: 4 },
  { id: "5takes", label: "5 Takes", sub: "40s", takes: 5 },
];

const CATEGORY_VISIBILITY: Record<string, string[]> = {
  clothing: ["Vestindo o produto", "Segurando o produto", "Selfie no espelho", "Selfie"],
  footwear: ["Vestindo o produto", "Segurando o produto", "Selfie"],
  accessories: ["Segurando o produto", "Selfie no espelho", "Selfie"],
  beauty: ["Segurando o produto", "Selfie no espelho", "Selfie"],
  electronics: ["Segurando o produto", "Selfie"],
  home: ["Segurando o produto", "Selfie"],
  food_beverage: ["Segurando o produto", "Selfie"],
  fitness: ["Vestindo o produto", "Segurando o produto", "Selfie"],
};
const CAMERA_INTERACTION_VISIBILITY: Record<string, string[]> = {
  frente: ["Vestindo o produto", "Segurando o produto", "Selfie no espelho", "Selfie"],
  pov: ["Segurando o produto", "Selfie"],
  demo: ["Segurando o produto", "Vestindo o produto", "Selfie"],
};
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

const allInteractionModes = ["Vestindo o produto", "Segurando o produto", "Selfie no espelho", "Selfie"];
const avatarPoses = ["De frente", "De lado", "3/4", "Sentado(a)", "Andando", "Personalizado"];
const enhancements = [
  "Luz natural", "Ultra-nitidez 8K", "Mãos perfeitas", "Brilho natural",
  "Tecido real", "Cabelo real", "Anti-IA", "Profundidade", "Grão foto",
];

const scenarioOptionsPt = [
  "Quarto", "Estúdio", "Cozinha", "Banheiro", "Sala", "Externo",
  "Academia", "Carro", "Bar", "Escritório", "Loja/Boutique", "Café",
];

const sceneOptions: { id: SceneType; label: string }[] = [
  { id: "quarto", label: "Quarto" }, { id: "escritorio", label: "Escritório" },
  { id: "cozinha", label: "Cozinha" }, { id: "banheiro", label: "Banheiro" },
  { id: "sala", label: "Sala" }, { id: "academia", label: "Academia" },
  { id: "bar", label: "Bar" }, { id: "externo", label: "Externo" },
  { id: "estudio", label: "Estúdio" }, { id: "loja", label: "Loja" },
  { id: "cafe", label: "Café" }, { id: "carro", label: "Carro" },
];
const angleOptions: { id: CameraAngle; label: string }[] = [
  { id: "frontal_medio", label: "Frontal Médio" }, { id: "close_up", label: "Close-up" },
  { id: "plano_americano", label: "Plano Americano" }, { id: "mirror_selfie", label: "Mirror Selfie" },
  { id: "pov", label: "POV" }, { id: "hook_mao", label: "Hook Mão" },
];
const lightingOptions: { id: LightingType; label: string }[] = [
  { id: "natural_suave", label: "Natural Suave" }, { id: "natural_forte", label: "Natural Forte" },
  { id: "artificial_quente", label: "Artificial Quente" }, { id: "fluorescente_fria", label: "Fluorescente Fria" },
  { id: "low_key_noturno", label: "Low-key Noturno" }, { id: "ambiente_bar", label: "Ambiente Bar" },
];
const interactionOptions: { id: TakeConfig["productInteraction"]; label: string }[] = [
  { id: "vestindo", label: "Vestindo" }, { id: "segurando", label: "Segurando" },
  { id: "espelho", label: "Espelho" }, { id: "demonstrando", label: "Demonstrando" },
];

interface Props {
  state: StudioState;
  updateState: (patch: Partial<StudioState>) => void;
  onAdvance?: () => void;
}

export function StudioStepFinal({ state, updateState, onAdvance }: Props) {
  const [interaction, setInteraction] = useState(allInteractionModes[0]);
  const [pose, setPose] = useState(avatarPoses[0]);
  const [customPose, setCustomPose] = useState("");
  const [enhance, setEnhance] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const numTakes = durations.find((d) => d.id === state.duration)?.takes || 1;
  const isAutomatic = state.generationMode === "automatico" && numTakes > 1;
  const [directorLoading, setDirectorLoading] = useState(false);
  const [storyboard, setStoryboard] = useState<TakeConfig[] | null>(null);

  const avatar = findAvatar(state.avatarId);

  const productCategory = (state.productCategory || "").toLowerCase();
  const categoryModes = CATEGORY_VISIBILITY[productCategory] || allInteractionModes;
  const cameraModes = CAMERA_INTERACTION_VISIBILITY[state.cameraStyle] || allInteractionModes;
  const visibleInteractionModes = allInteractionModes.filter(
    (m) => categoryModes.includes(m) && cameraModes.includes(m)
  );
  const visibleVideoStyleIds = CATEGORY_VIDEOSTYLE_VISIBILITY[productCategory] || videoStyles.map(v => v.id);
  const visibleVideoStyles = videoStyles.filter(v => visibleVideoStyleIds.includes(v.id));

  const toggleScenario = (tag: string) => {
    const has = state.scenarioTags.includes(tag);
    updateState({ scenarioTags: has ? state.scenarioTags.filter((t) => t !== tag) : [...state.scenarioTags, tag] });
  };

  const ensureTakes = (n: number): TakeConfig[] => {
    const current = state.takes.length ? state.takes : [];
    const result: TakeConfig[] = [];
    for (let i = 0; i < n; i++) result.push(current[i] || defaultTake(i + 1));
    return result;
  };

  const updateTake = (index: number, patch: Partial<TakeConfig>) => {
    const takes = ensureTakes(numTakes);
    takes[index] = { ...takes[index], ...patch };
    updateState({ takes });
  };

  const moveExtraTakesToLibrary = (nextCount: number) => {
    const generated = (state.takes || []).slice(nextCount).map((t) => t.imageJob).filter(Boolean);
    if (generated.length) updateState({ _generatedTakes: [...(state._generatedTakes || []), ...generated] });
  };

  const handleDurationChange = (d: typeof durations[number]) => {
    const currentGenerated = (state.takes || []).filter((t) => t.imageJob).length;
    if (d.takes < currentGenerated) {
      const lost = Array.from({ length: currentGenerated - d.takes }, (_, i) => d.takes + i + 1).join(", ");
      const ok = window.confirm(`Você está selecionando menos takes do que já foi gerado. Caso prossiga perderá o take ${lost}.`);
      if (!ok) return;
      moveExtraTakesToLibrary(d.takes);
    }
    updateState({ duration: d.id, numTakes: d.takes as 1|2|3|4|5, takes: ensureTakes(d.takes).slice(0, d.takes) });
  };

  const showManualOptions = numTakes === 1 || (numTakes > 1 && !isAutomatic);

  const fetchAvatarAsDataUrl = async (src: string): Promise<string | null> => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  };

  const handleGenerateUGC = async () => {
    if (!state.productId) { toast.error("Selecione um produto antes"); return; }
    if (!state.avatarId) { toast.error("Selecione um avatar antes"); return; }
    setGenerating(true);
    try {
      const finalPose = pose === "Personalizado" && customPose ? customPose : pose;
      const referenceImageUrl = avatar?.img ? await fetchAvatarAsDataUrl(avatar.img) : null;
      const { data, error } = await supabase.functions.invoke("generate-ugc", {
        body: {
          productId: state.productId, productName: state.productName,
          productDescription: state.productDescription, productCategory: state.productCategory,
          productImageUrl: state.productImageUrl, productImages: state.productImages,
          catalogProductId: state.catalogProductId, avatarId: state.avatarId,
          avatarName: avatar?.name || state.avatarId, referenceImageUrl,
          pose: finalPose, interaction, scenarioTags: state.scenarioTags,
          scenarioText: state.scenarioText, cameraStyle: state.cameraStyle,
          videoStyle: state.videoStyle, videoFormat: state.videoFormat,
          enhancements: enhance,
          proximity: state.proximity, energy: state.energy, naturalness: state.naturalness,
          duration: state.duration, voiceGender: state.voiceGender,
          voiceTone: state.voiceTone, voiceEnergy: state.voiceEnergy,
          voiceStyle: state.voiceStyle, script: state.script,
        },
      });
      if (error) throw error;
      if (!data?.success) {
        if (data?.errorCode === "AI_CREDITS_EXHAUSTED") { toast.error("Créditos do Gemini esgotados."); return; }
        if (data?.errorCode === "RATE_LIMIT") { toast.error("Muitas requisições. Aguarde alguns segundos."); return; }
        if (data?.errorCode === "MODEL_OVERLOADED") { toast.error("Gemini sobrecarregado. Tente em 1-2 min."); return; }
        throw new Error(data?.error || "Falha na geração");
      }
      updateState({ _generatedJob: data.job, script: state.script || data.job?.script_prompt?.script || "" });
      fireConfetti();
      toast.success("UGC gerado! Avance para a etapa de Prompt Final.");
    } catch (err: any) {
      const msg = err?.message || "Erro ao gerar UGC";
      if (msg.includes("Rate") || msg.includes("429")) toast.error("Muitas requisições. Aguarde.");
      else if (msg.includes("Payment") || msg.includes("402") || msg.includes("credit")) toast.error("Créditos esgotados.");
      else toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const generateUGCJob = async (overrides: Partial<TakeConfig> = {}, previousJobs: any[] = []) => {
    const finalPose = pose === "Personalizado" && customPose ? customPose : pose;
    const referenceImageUrl = avatar?.img ? await fetchAvatarAsDataUrl(avatar.img) : null;
    const sceneLabel = overrides.scenarioText || overrides.scene || state.scenarioText;
    const { data, error } = await supabase.functions.invoke("generate-ugc", {
      body: {
        productId: state.productId, productName: state.productName,
        productDescription: state.productDescription, productCategory: state.productCategory,
        productImageUrl: state.productImageUrl, productImages: state.productImages,
        catalogProductId: state.catalogProductId, avatarId: state.avatarId,
        avatarName: avatar?.name || state.avatarId, referenceImageUrl,
        pose: finalPose, interaction: overrides.interaction || interaction,
        scenarioTags: sceneLabel ? [String(sceneLabel)] : state.scenarioTags,
        scenarioText: sceneLabel || state.scenarioText,
        cameraStyle: overrides.cameraStyle || state.cameraStyle,
        videoStyle: overrides.videoStyle || state.videoStyle,
        videoFormat: state.videoFormat,
        enhancements: enhance,
        proximity: state.proximity, energy: state.energy, naturalness: state.naturalness,
        duration: "1take", voiceGender: state.voiceGender,
        voiceTone: state.voiceTone, voiceEnergy: state.voiceEnergy,
        voiceStyle: state.voiceStyle, script: overrides.dialogue || state.script,
        takeContext: { take: overrides.takeNumber, previousImages: previousJobs.map((j) => j.image_url).filter(Boolean) },
      },
    });
    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || "Falha na geração");
    return data.job;
  };

  const handleGenerateTakeImage = async (index: number) => {
    if (!state.productId || !state.avatarId) { toast.error("Selecione produto e avatar antes"); return; }
    setGenerating(true);
    try {
      const takes = ensureTakes(numTakes);
      const previousJobs = takes.slice(0, index).map((t) => t.imageJob).filter(Boolean);
      const job = await generateUGCJob(takes[index], previousJobs);
      updateTake(index, { imageJob: job, dialogue: takes[index].dialogue || job?.script_prompt?.script || "" });
      updateState({ _generatedJob: index === 0 ? job : state._generatedJob, script: state.script || job?.script_prompt?.script || "" });
      toast.success(`Take ${index + 1} gerado!`);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar take");
    } finally {
      setGenerating(false);
    }
  };

  const autoMessages = (count: number) => [
    "Criando ideia de post de alta conversão",
    ...Array.from({ length: count }, (_, i) => `Gerando cena ${i + 1}`),
    ...Array.from({ length: Math.max(0, count - 1) }, (_, i) => `Criando cena ${i + 2}`),
    "Finalizando",
    "Últimos ajustes",
  ];

  const handleAutomaticGenerateAll = async () => {
    if (!state.productId || !state.avatarId) { toast.error("Selecione produto e avatar antes"); return; }
    setGenerating(true);
    onAdvance?.();
    const messages = autoMessages(numTakes);
    try {
      updateState({ _generationProgress: { active: true, step: 1, total: messages.length, label: messages[0] } });
      const { data, error } = await supabase.functions.invoke("studio-director", {
        body: {
          product: { name: state.productName, category: state.productCategory, image_url: state.productImageUrl },
          avatar: { id: state.avatarId, name: avatar?.name, gender: state.voiceGender === "feminino" ? "female" : "male" },
          style: state.videoStyle, num_takes: numTakes, total_duration_seconds: numTakes * 8,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Falha ao criar ideias dos takes");
      const planned = (data.takes || []).map((t: any, i: number) => ({
        ...defaultTake(i + 1),
        scene: t.scene || "quarto", cameraAngle: t.camera_angle || "frontal_medio",
        cameraStyle: state.cameraStyle, videoStyle: state.videoStyle,
        lighting: t.lighting || "natural_suave", cameraMovement: t.camera_movement || "handheld_suave",
        productInteraction: t.product_interaction || "vestindo", dialogue: t.dialogue_hint || "",
        veo3Prompt: t.veo3_prompt,
      })).slice(0, numTakes);
      const jobs: any[] = [];
      for (let i = 0; i < numTakes; i++) {
        updateState({ _generationProgress: { active: true, step: i + 2, total: messages.length, label: `Gerando cena ${i + 1}` } });
        const job = await generateUGCJob(planned[i], jobs);
        jobs.push(job);
        planned[i].imageJob = job;
        planned[i].dialogue = planned[i].dialogue || job?.script_prompt?.script || "";
      }
      updateState({
        takes: planned,
        _generatedTakes: jobs,
        _generatedJob: jobs[0],
        script: planned.map((t) => t.dialogue).filter(Boolean).join(" "),
        _generationProgress: { active: false, step: messages.length, total: messages.length, label: "Últimos ajustes" },
      });
      fireConfetti();
      toast.success("Takes automáticos gerados!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar automaticamente");
      updateState({ _generationProgress: null });
    } finally {
      setGenerating(false);
    }
  };

  const handleAutoGenerateTake = async (index: number) => {
    if (directorLoading) return;
    setDirectorLoading(true);
    const toastId = toast.loading("Agente Director gerando sequência...");
    try {
      const { data, error } = await supabase.functions.invoke("studio-director", {
        body: {
          product: { name: state.productName, category: state.productCategory, image_url: state.productImageUrl },
          avatar: { id: state.avatarId, name: avatar?.name, gender: state.voiceGender === "feminino" ? "female" : "male" },
          style: state.videoStyle,
          num_takes: numTakes,
          total_duration_seconds: numTakes * 8,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Falha ao gerar sequência");
      const takes: TakeConfig[] = (data.takes || []).map((t: any, i: number) => ({
        takeNumber: i + 1, durationSeconds: 8 as const,
        scene: t.scene || "quarto", cameraAngle: t.camera_angle || "frontal_medio",
        lighting: t.lighting || "natural_suave", cameraMovement: t.camera_movement || "handheld_suave",
        productInteraction: t.product_interaction || "vestindo", dialogue: t.dialogue_hint || "",
        veo3Prompt: t.veo3_prompt,
      }));
      setStoryboard(takes);
      updateState({ takes });
      toast.success("Sequência gerada!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar sequência", { id: toastId });
    } finally {
      setDirectorLoading(false);
    }
  };

  const handleAutoGenerateTake = async (index: number) => {
    const toastId = toast.loading(`Gerando take ${index + 1} automaticamente...`);
    try {
      const previousTakes = ensureTakes(numTakes).slice(0, index);
      const { data, error } = await supabase.functions.invoke("studio-director", {
        body: {
          product: { name: state.productName, category: state.productCategory, image_url: state.productImageUrl },
          avatar: { id: state.avatarId, name: avatar?.name, gender: state.voiceGender === "feminino" ? "female" : "male" },
          style: state.videoStyle, num_takes: 1, total_duration_seconds: 8,
          previous_takes: previousTakes,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Falha");
      const t = data.takes?.[0];
      if (t) {
        updateTake(index, {
          scene: t.scene || "quarto", cameraAngle: t.camera_angle || "frontal_medio",
          lighting: t.lighting || "natural_suave", cameraMovement: t.camera_movement || "handheld_suave",
          productInteraction: t.product_interaction || "vestindo", dialogue: t.dialogue_hint || "",
        });
      }
      toast.success(`Take ${index + 1} gerado!`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Erro", { id: toastId });
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

  const generatedJob = state._generatedJob;
  const previewAspect = state.videoFormat === "16:9" ? "aspect-[16/9] w-80"
    : state.videoFormat === "1:1" ? "aspect-square w-56"
    : state.videoFormat === "3:4" ? "aspect-[3/4] w-48"
    : "aspect-[9/16] w-56";

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Imagem UGC</h2>
        <p className="text-muted-foreground">Configure o formato, estilo e gere a imagem com IA.</p>
      </div>

      {/* 1. FORMATO DO VÍDEO */}
      <div className={`${glassCard} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Ratio size={18} className="text-primary" />
          <h3 className="font-bold tracking-tight">Formato do Vídeo</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {videoFormats.map((f) => {
            const sel = state.videoFormat === f.id;
            return (
              <div key={f.id} onClick={() => updateState({ videoFormat: f.id })} className={`${glassSelectable(sel)} p-4 text-center`}>
                <div className={`mx-auto w-10 h-14 rounded-lg border-2 mb-2 flex items-center justify-center ${sel ? "border-primary bg-primary/10" : "border-border/60"}`}>
                  <span className="text-[10px] font-black">{f.id}</span>
                </div>
                <p className="font-bold text-sm">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. QUANTIDADE DE TAKES */}
      <div className={`${glassCard} p-6`}>
        <h3 className="font-bold tracking-tight mb-4">Quantidade de Takes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {durations.map((d) => {
            const sel = state.duration === d.id;
            return (
              <div key={d.id} onClick={() => handleDurationChange(d)} className={`${glassSelectable(sel)} p-4 text-center`}>
                <p className="font-bold text-sm">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AUTO/MANUAL MODE — only when takes > 1 */}
      {numTakes > 1 && (
        <div className={`${glassCard} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold tracking-tight">Modo de Geração</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAutomatic
                  ? "A IA gera tudo automaticamente (imagem + prompt)"
                  : "Configure cada take manualmente"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{isAutomatic ? "Automático" : "Manual"}</span>
              <Switch checked={isAutomatic} onCheckedChange={(checked) => updateState({ generationMode: checked ? "automatico" : "manual" })} />
            </div>
          </div>
        </div>
      )}

      {/* 4. TIPO DE CÂMERA, ESTILO, MESCLAR, CENÁRIO - Only show here when it's exactly 1 take */}
      {numTakes === 1 && (
        <>
          {/* 4. TIPO DE CÂMERA */}
          <div className={`${glassCard} p-6`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Tipo de Câmera</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {cameraStyles.map((c) => {
                const sel = state.cameraStyle === c.id;
                return (
                  <div key={c.id} onClick={() => updateState({ cameraStyle: c.id })} className={`${glassSelectable(sel)} p-3 text-center`}>
                    <div className={`relative aspect-square w-full rounded-xl overflow-hidden mb-3 ring-2 transition-all ${sel ? "ring-primary shadow-lg shadow-primary/30" : "ring-transparent"}`}>
                      <img src={c.img} alt={c.label} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      {sel && <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />}
                    </div>
                    <p className="font-bold text-sm">{c.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{c.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. ESTILO DO VÍDEO */}
          <div className={`${glassCard} p-6`}>
            <h3 className="font-bold tracking-tight mb-1">Estilo do Vídeo</h3>
            <p className="text-xs text-muted-foreground mb-4">Tom geral da produção</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {visibleVideoStyles.map((v) => {
                const Icon = v.icon;
                const sel = state.videoStyle === v.id;
                return (
                  <div key={v.id} onClick={() => updateState({ videoStyle: v.id })} className={`${glassSelectable(sel)} p-4`}>
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

          {/* 6. MESCLAR COM IA */}
          <div className={`${glassCard} p-6`}>
            <h3 className="font-bold tracking-tight mb-1">Mesclar com IA</h3>
            <p className="text-xs text-muted-foreground mb-5">Avatar + Produto + Cenário → foto realista</p>
            <div className="space-y-5">
              <PillGroup label="Modo de interação" options={visibleInteractionModes} value={interaction} onChange={setInteraction} />
              <div>
                <PillGroup label="Pose do avatar" options={avatarPoses} value={pose} onChange={setPose} />
                {pose === "Personalizado" && (
                  <input value={customPose} onChange={(e) => setCustomPose(e.target.value)}
                    placeholder="Descreva a pose desejada..."
                    className="w-full mt-3 h-10 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 px-3 text-sm focus:outline-none focus:border-primary" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Melhorias opcionais</p>
                <div className="flex flex-wrap gap-1.5">
                  {enhancements.map((e) => {
                    const sel = enhance.includes(e);
                    return (
                      <button key={e} onClick={() => setEnhance(sel ? enhance.filter((x) => x !== e) : [...enhance, e])}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                          sel ? "bg-primary/20 border border-primary text-primary shadow-[0_4px_16px_hsl(var(--primary)/0.25)]"
                            : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                        }`}>{e}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 7. CENÁRIO */}
          <div className={`${glassCard} p-6`}>
            <h3 className="font-bold tracking-tight mb-1">Cenário</h3>
            <p className="text-xs text-muted-foreground mb-4">No automático, a IA pode variar os ambientes entre os takes.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {scenarioOptionsPt.map((tag) => {
                const sel = state.scenarioTags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleScenario(tag)}
                    className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md transition-all ${
                      sel ? "bg-primary/20 border border-primary text-primary shadow-[0_4px_16px_hsl(var(--primary)/0.25)]"
                        : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                    }`}>{tag}</button>
                );
              })}
            </div>
            <input value={state.scenarioText} onChange={(e) => updateState({ scenarioText: e.target.value })}
              placeholder="Ou descreva o cenário em texto..."
              className="w-full h-11 rounded-xl bg-card/60 border border-border/60 px-3 text-sm focus:outline-none focus:border-primary" />
          </div>

      {/* Manual per-take config — always show when takes > 1 and manual (Requested: Scenario, Style, Merge, Camera must appear in each take modal) */}
      {numTakes > 1 && !isAutomatic && (
        <div className={`${glassCard} p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone size={18} className="text-primary" />
            <h3 className="font-bold tracking-tight">Configuração por Take</h3>
          </div>
          <div className="space-y-4">
            {Array.from({ length: numTakes }).map((_, i) => {
              const takes = ensureTakes(numTakes);
              const take = takes[i];
              const isPreviousTakeGenerated = i === 0 || !!takes[i - 1]?.imageJob?.image_url;
              
              return (
                <TakeAccordion
                  key={i}
                  index={i}
                  take={take}
                  onUpdate={(patch) => updateTake(i, patch)}
                  onAutoGenerate={() => handleAutoGenerateTake(i)}
                  onGenerateImage={() => handleGenerateTakeImage(i)}
                  generating={generating}
                  cameraStyles={cameraStyles}
                  videoStyles={visibleVideoStyles}
                  interactions={visibleInteractionModes}
                  isUnlocked={isPreviousTakeGenerated}
                  avatarPoses={avatarPoses}
                />
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

      {/* AUTO MODE: Director generate */}
      {numTakes > 1 && isAutomatic && (
        <div className={`${glassCard} p-6`}>
          <h3 className="font-bold tracking-tight mb-1">Modo Automático</h3>
          <p className="text-xs text-muted-foreground mb-4">
            A IA vai criar as cenas, gerar as imagens e abrir a etapa 4 com o progresso salvo.
          </p>
          <button onClick={handleAutomaticGenerateAll} disabled={generating}
            className="group relative w-full h-12 rounded-xl overflow-hidden font-bold text-base text-white shadow-lg shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed">
            <span className="absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--primary)),#9333ea,#c084fc,#9333ea,hsl(var(--primary)))] bg-[length:300%_100%] animate-[shimmer_3s_linear_infinite]" />
            <span className="relative flex items-center justify-center gap-2">
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {generating ? "Gerando sequência..." : "Gerar UGC automático"}
            </span>
          </button>
        </div>
      )}

      {/* Gerar UGC — only in manual/single mode */}
      {showManualOptions && (
        <div className={`${glassCard} p-6`}>
          <button onClick={handleGenerateUGC} disabled={generating}
            className="group relative w-full h-12 rounded-xl overflow-hidden font-bold text-base text-white shadow-lg shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed">
            <span className="absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--primary)),#9333ea,#c084fc,#9333ea,hsl(var(--primary)))] bg-[length:300%_100%] animate-[shimmer_3s_linear_infinite]" />
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <span className="relative flex items-center justify-center gap-2">
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {generating ? "Gerando UGC..." : generatedJob ? "Regerar UGC" : "Gerar UGC"}
            </span>
          </button>

          {/* Preview */}
          <AnimatePresence>
            {(generating || generatedJob?.image_url) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-center pt-4">
                <div className={`relative ${previewAspect} rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-background`}>
                  {generating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary">
                      <Loader2 size={28} className="animate-spin" /><p className="text-xs font-bold">Gerando UGC...</p>
                    </div>
                  ) : generatedJob?.image_url ? (
                    <motion.img src={generatedJob.image_url} alt="UGC"
                      initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                      className="absolute inset-0 w-full h-full object-cover" />
                  ) : null}
                  {generatedJob?.image_url && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-md border border-border/60 text-[9px] font-bold flex items-center gap-1 z-10">
                      <Sparkles size={9} className="text-primary" /> UGC pronto
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// === Sub-components ===

function PillGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const sel = value === opt;
          return (
            <button key={opt} onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                sel ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/30"
                  : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
              }`}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

function TakeAccordion({ index, take, onUpdate, onAutoGenerate, onGenerateImage, generating, cameraStyles, videoStyles, interactions, isUnlocked }: {
  index: number; take: TakeConfig; onUpdate: (patch: Partial<TakeConfig>) => void; onAutoGenerate: () => void;
  onGenerateImage: () => void; generating: boolean;
  cameraStyles: { id: string; label: string; img: any }[]; videoStyles: { id: VideoStyle; label: string; icon: any }[]; interactions: string[];
  isUnlocked: boolean; avatarPoses: string[];
}) {
  const [open, setOpen] = useState(index === 0);
  const [autoLoading, setAutoLoading] = useState(false);

  const handleAuto = async () => {
    setAutoLoading(true);
    await onAutoGenerate();
    setAutoLoading(false);
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/20 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-black text-primary">{index + 1}</div>
          <div className="text-left">
            <p className="text-sm font-bold">Take {index + 1} — 8s</p>
            <p className="text-[10px] text-muted-foreground capitalize">{take.scene} · {take.cameraAngle.replace(/_/g, " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isUnlocked && index > 0 && <Smartphone size={14} className="text-muted-foreground/40" />}
          <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={16} className="text-muted-foreground" /></motion.div>
        </div>
      </button>
      <AnimatePresence>
        {open && !isUnlocked && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-4 pb-4">
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
                <Smartphone size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs font-bold text-muted-foreground">Take Bloqueado</p>
                <p className="text-[10px] text-muted-foreground mt-1">Gere a imagem do Take {index} para liberar as configurações deste take.</p>
              </div>
            </div>
          </motion.div>
        )}
        {open && isUnlocked && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex justify-end mb-2">
                <Button onClick={handleAuto} disabled={autoLoading} size="sm" className="h-8 rounded-full gap-1.5 bg-primary text-primary-foreground px-3 text-[11px]">
                  {autoLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {autoLoading ? "Gerando..." : "Gerar com IA"}
                </Button>
              </div>

              {take.imageJob?.image_url && (
                <div className="mx-auto w-32 aspect-[9/16] rounded-xl overflow-hidden border border-border/60 mb-2 relative group">
                  <img src={take.imageJob.image_url} alt={`Take ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={onGenerateImage} disabled={generating} size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                      Regerar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* 4. TIPO DE CÂMERA */}
                <div className="bg-background/40 p-4 rounded-xl border border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Tipo de Câmera</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {cameraStyles.map((c: any) => {
                      const sel = (take.cameraStyle || "frente") === c.id;
                      return (
                        <div key={c.id} onClick={() => onUpdate({ cameraStyle: c.id })} className={`${glassSelectable(sel)} p-2 text-center`}>
                          <div className={`relative aspect-square w-full rounded-lg overflow-hidden mb-2 ring-1 transition-all ${sel ? "ring-primary shadow-md" : "ring-transparent"}`}>
                            <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-bold text-[11px]">{c.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. ESTILO DO VÍDEO */}
                <div className="bg-background/40 p-4 rounded-xl border border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Estilo do Vídeo</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {videoStyles.map((v) => {
                      const Icon = v.icon;
                      const sel = (take.videoStyle || "ugc_autentico") === v.id;
                      return (
                        <div key={v.id} onClick={() => onUpdate({ videoStyle: v.id })} className={`${glassSelectable(sel)} p-3 flex flex-col items-center text-center`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                            sel ? "bg-gradient-to-br from-primary to-purple-600 text-white" : "bg-accent"
                          }`}><Icon size={14} /></div>
                          <p className="font-bold text-[10px]">{v.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. MESCLAR COM IA (Interação e Pose) */}
                <div className="bg-background/40 p-4 rounded-xl border border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Mesclar com IA</p>
                  <div className="space-y-3">
                    <PillGroup label="Modo de interação" options={interactions} value={take.interaction || interactions[0]} onChange={(v) => onUpdate({ interaction: v })} />
                    <PillGroup label="Pose do avatar" options={avatarPoses} value={take.pose || avatarPoses[0]} onChange={(v) => onUpdate({ pose: v })} />
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Cenário Personalizado</p>
                <input value={take.scenarioText || ""} onChange={(e) => onUpdate({ scenarioText: e.target.value })}
                  placeholder="Descreva o cenário deste take..."
                  className="w-full h-9 rounded-lg bg-card/60 border border-border/60 px-2 text-xs focus:outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Ambiente" value={take.scene} options={sceneOptions} onChange={(v) => onUpdate({ scene: v as SceneType })} />
                <SelectField label="Ângulo" value={take.cameraAngle} options={angleOptions} onChange={(v) => onUpdate({ cameraAngle: v as CameraAngle })} />
                <SelectField label="Luz" value={take.lighting} options={lightingOptions} onChange={(v) => onUpdate({ lighting: v as LightingType })} />
                <SelectField label="Ação" value={take.productInteraction} options={interactionOptions} onChange={(v) => onUpdate({ productInteraction: v as TakeConfig["productInteraction"] })} />
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Roteiro do Take (máx. 20 palavras)</p>
                <Textarea value={take.dialogue} onChange={(e) => onUpdate({ dialogue: e.target.value })}
                  placeholder="Roteiro para este take..." className="min-h-[60px] rounded-xl resize-none text-sm" />
                <p className="text-[10px] text-muted-foreground text-right mt-1">
                  {take.dialogue.trim() ? take.dialogue.trim().split(/\s+/).length : 0}/20 palavras
                </p>
              </div>

              <div className="pt-2">
                <Button onClick={onGenerateImage} disabled={generating} className="w-full rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600 shadow-md">
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {take.imageJob?.image_url ? "Regerar imagem" : "Gerar UGC deste take"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-lg bg-card/60 border border-border/60 px-2 text-xs font-medium focus:outline-none focus:border-primary appearance-none cursor-pointer">
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}
