import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wand2, Copy, ChevronDown, ExternalLink, Sparkles, Image as ImageIcon,
  Loader2, Download, X, Rocket, History, Megaphone, ThumbsUp, BookOpen,
  Film, Camera, Zap, Video, Eye, Hand, Smartphone, Music, MonitorSmartphone,
  Ratio, ToggleLeft, ToggleRight, Plus,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { glassCard, glassSelectable } from "./glass";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { StudioState } from "@/pages/app/Studio";
import { findAvatar } from "./avatars";
import type {
  VideoStyle, VideoFormat, GenerationMode, TakeConfig,
  SceneType, CameraAngle, LightingType, CameraMovement,
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

const videoFormats: { id: VideoFormat; label: string; desc: string; ratio: string }[] = [
  { id: "9:16", label: "9:16", desc: "TikTok / Reels", ratio: "aspect-[9/16]" },
  { id: "16:9", label: "16:9", desc: "YouTube", ratio: "aspect-[16/9]" },
  { id: "3:4", label: "3:4", desc: "Feed", ratio: "aspect-[3/4]" },
  { id: "1:1", label: "1:1", desc: "Quadrado", ratio: "aspect-square" },
];

const durations = [
  { id: "1take", label: "1 Take", sub: "8s", takes: 1 },
  { id: "2takes", label: "2 Takes", sub: "16s", takes: 2 },
  { id: "3takes", label: "3 Takes", sub: "24s", takes: 3 },
  { id: "4takes", label: "4 Takes", sub: "32s", takes: 4 },
  { id: "5takes", label: "5 Takes", sub: "40s", takes: 5 },
];

const voiceOptions = {
  voiceGender: { label: "Gênero", options: ["feminino", "masculino"] },
  voiceTone: { label: "Tom de Voz", options: ["natural", "expressivo", "calmo", "intenso"] },
  voiceEnergy: { label: "Energia", options: ["baixa", "media", "alta"] },
  voiceStyle: { label: "Estilo", options: ["conversacional", "narrativo", "publicitario"] },
};

// Visibility matrix by product category + camera style
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

const scriptTemplates = [
  { id: "promocional", icon: Megaphone, title: "Promocional", desc: "Promovendo o produto com oferta e CTA forte" },
  { id: "indicacional", icon: ThumbsUp, title: "Indicacional", desc: "Indicação autêntica de quem já usa" },
  { id: "storytelling", icon: BookOpen, title: "Storytelling", desc: "História pessoal conectando com o produto" },
];

// Take manual field options
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
}

export function StudioStepFinal({ state, updateState }: Props) {
  const navigate = useNavigate();
  const [interaction, setInteraction] = useState(allInteractionModes[0]);
  const [pose, setPose] = useState(avatarPoses[0]);
  const [customPose, setCustomPose] = useState("");
  const [enhance, setEnhance] = useState<string[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [promptGenerated, setPromptGenerated] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedJob, setGeneratedJob] = useState<any>(null);
  const [scriptLoading, setScriptLoading] = useState<string | null>(null);
  const [veo3Loading, setVeo3Loading] = useState(false);
  const [veo3Stage, setVeo3Stage] = useState<"idle" | "analyzing" | "generating">("idle");
  const [veo3Prompt, setVeo3Prompt] = useState<string | null>(null);
  const [veo3Analysis, setVeo3Analysis] = useState<any>(null);
  const [veo3Metadata, setVeo3Metadata] = useState<any>(null);
  const [directorLoading, setDirectorLoading] = useState(false);
  const [storyboard, setStoryboard] = useState<TakeConfig[] | null>(null);
  const [activePromptTab, setActivePromptTab] = useState(0);
  const [veo3Prompts, setVeo3Prompts] = useState<string[]>([]);
  const [isAutomatic, setIsAutomatic] = useState(true);

  const avatar = findAvatar(state.avatarId);
  const numTakes = durations.find((d) => d.id === state.duration)?.takes || 1;

  // Compute visible interaction modes based on category + camera
  const productCategory = (state.productCategory || "").toLowerCase();
  const categoryModes = CATEGORY_VISIBILITY[productCategory] || allInteractionModes;
  const cameraModes = CAMERA_INTERACTION_VISIBILITY[state.cameraStyle] || allInteractionModes;
  const visibleInteractionModes = allInteractionModes.filter(
    (m) => categoryModes.includes(m) && cameraModes.includes(m)
  );

  // Compute visible video styles based on category
  const visibleVideoStyleIds = CATEGORY_VIDEOSTYLE_VISIBILITY[productCategory] || videoStyles.map(v => v.id);
  const visibleVideoStyles = videoStyles.filter(v => visibleVideoStyleIds.includes(v.id));

  // Sync takes array when numTakes changes
  const ensureTakes = (n: number): TakeConfig[] => {
    const current = state.takes.length ? state.takes : [];
    const result: TakeConfig[] = [];
    for (let i = 0; i < n; i++) {
      result.push(current[i] || defaultTake(i + 1));
    }
    return result;
  };

  const updateTake = (index: number, patch: Partial<TakeConfig>) => {
    const takes = ensureTakes(numTakes);
    takes[index] = { ...takes[index], ...patch };
    updateState({ takes });
  };

  // === Handlers ===

  const handleGenerateScriptAI = async (type: "promocional" | "indicacional" | "storytelling", title: string) => {
    if (scriptLoading) return;
    setScriptLoading(type);
    const toastId = toast.loading(`Gerando roteiro ${title}...`);
    try {
      const { data, error } = await supabase.functions.invoke("generate-script", {
        body: {
          scriptType: type,
          productId: state.productId,
          catalogProductId: state.catalogProductId,
          productName: state.productName,
          productDescription: state.productDescription,
          productCategory: state.productCategory,
          voiceGender: state.voiceGender,
          voiceTone: state.voiceTone,
          voiceEnergy: state.voiceEnergy,
          voiceStyle: state.voiceStyle,
          duration: state.duration,
          videoStyle: state.videoStyle,
          numTakes,
        },
      });
      if (error) throw error;
      if (!data?.success) {
        if (data?.errorCode === "AI_CREDITS_EXHAUSTED") { toast.error("Créditos do Gemini esgotados.", { id: toastId }); return; }
        if (data?.errorCode === "RATE_LIMIT") { toast.error("Muitas requisições. Aguarde alguns segundos.", { id: toastId }); return; }
        if (data?.errorCode === "MODEL_OVERLOADED") { toast.error("Gemini sobrecarregado. Tente em 1-2 min.", { id: toastId }); return; }
        throw new Error(data?.error || "Falha ao gerar roteiro");
      }
      updateState({ script: data.script });
      toast.success(`Roteiro ${title} pronto!`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar roteiro", { id: toastId });
    } finally {
      setScriptLoading(null);
    }
  };

  const detectScriptType = (text: string): "promocional" | "indicacional" | "storytelling" => {
    const t = text.toLowerCase();
    if (/(deixa eu te contar|aconteceu|eu vivia|semana passada|antes eu)/.test(t)) return "storytelling";
    if (/(corre|promo|link na bio|antes que acabe|aproveita|garante o seu)/.test(t)) return "promocional";
    if (/(indic|recomend|de verdade|vale a pena|olha que)/.test(t)) return "indicacional";
    return "promocional";
  };

  const handleDirectorGenerate = async () => {
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
        takeNumber: i + 1,
        durationSeconds: 8 as const,
        scene: t.scene || "quarto",
        cameraAngle: t.camera_angle || "frontal_medio",
        lighting: t.lighting || "natural_suave",
        cameraMovement: t.camera_movement || "handheld_suave",
        productInteraction: t.product_interaction || "vestindo",
        dialogue: t.dialogue_hint || "",
        veo3Prompt: t.veo3_prompt,
      }));
      setStoryboard(takes);
      updateState({ takes });
      toast.success("Sequência gerada! Revise o storyboard abaixo.", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar sequência", { id: toastId });
    } finally {
      setDirectorLoading(false);
    }
  };

  const handleGenerateVeo3Prompt = async () => {
    if (!generatedJob?.image_url) { toast.error("Gere a imagem UGC primeiro"); return; }
    if (!state.script.trim()) { toast.error("Escreva ou gere o roteiro antes"); return; }
    if (veo3Loading) return;

    setVeo3Loading(true);
    setVeo3Stage("analyzing");
    const toastId = toast.loading("Analisando imagem UGC...");

    try {
      const analyzeRes = await supabase.functions.invoke("analyze-ugc-image", {
        body: {
          jobId: generatedJob.id,
          ugcImageUrl: generatedJob.image_url,
          productName: state.productName,
          productDescription: state.productDescription,
          productCategory: state.productCategory,
          avatarName: avatar?.name || state.avatarId,
        },
      });
      if (analyzeRes.error) throw analyzeRes.error;
      const analyzeData: any = analyzeRes.data;
      if (!analyzeData?.success) {
        const code = analyzeData?.errorCode;
        if (code === "AI_CREDITS_EXHAUSTED") throw new Error("Créditos do Gemini esgotados.");
        if (code === "RATE_LIMIT") throw new Error("Muitas requisições. Aguarde alguns segundos.");
        if (code === "MODEL_OVERLOADED") throw new Error("Gemini sobrecarregado. Tente em 1-2 min.");
        throw new Error(analyzeData?.error || "Falha ao analisar imagem");
      }
      const report = analyzeData.report;
      setVeo3Analysis(report);

      if (analyzeData.status === "regenerate") {
        toast.warning(`Qualidade baixa (${report.qualityScore}/10). Considere regenerar.`, { id: toastId, duration: 6000 });
      } else {
        toast.loading(`Análise OK (${report.qualityScore}/10). Gerando prompt...`, { id: toastId });
      }

      setVeo3Stage("generating");
      const scriptType = detectScriptType(state.script);
      const promptRes = await supabase.functions.invoke("generate-veo3-prompt", {
        body: {
          jobId: generatedJob.id,
          ugcImageUrl: generatedJob.image_url,
          analysisReport: report,
          script: state.script,
          scriptType,
          videoStyle: state.videoStyle,
          videoFormat: state.videoFormat,
          numTakes,
          takes: state.takes.length ? state.takes : undefined,
          voice: { gender: state.voiceGender, tone: state.voiceTone, energy: state.voiceEnergy, style: state.voiceStyle },
          product: { name: state.productName, description: state.productDescription, category: state.productCategory },
          avatar: { name: avatar?.name || state.avatarId },
        },
      });
      if (promptRes.error) throw promptRes.error;
      const promptData: any = promptRes.data;
      if (!promptData?.success) {
        const code = promptData?.errorCode;
        if (code === "AI_CREDITS_EXHAUSTED") throw new Error("Créditos do Gemini esgotados.");
        if (code === "RATE_LIMIT") throw new Error("Muitas requisições. Aguarde alguns segundos.");
        if (code === "MODEL_OVERLOADED") throw new Error("Gemini sobrecarregado. Tente em 1-2 min.");
        throw new Error(promptData?.error || "Falha ao gerar prompt Veo 3");
      }

      if (promptData.prompts && Array.isArray(promptData.prompts)) {
        setVeo3Prompts(promptData.prompts.map((p: any) => p.veo3Prompt || p));
        setVeo3Prompt(promptData.prompts[0]?.veo3Prompt || promptData.prompts[0]);
      } else {
        setVeo3Prompt(promptData.veo3Prompt);
        setVeo3Prompts([promptData.veo3Prompt]);
      }
      setVeo3Metadata(promptData.metadata);
      setPromptGenerated(true);
      setManualOpen(true);
      navigator.clipboard.writeText(
        promptData.prompts
          ? promptData.prompts.map((p: any, i: number) => `--- TAKE ${i + 1} ---\n${p.veo3Prompt || p}`).join("\n\n")
          : promptData.veo3Prompt
      ).catch(() => {});
      fireConfetti();
      toast.success("Prompt(s) Veo 3 gerado(s) e copiado(s)!", { id: toastId });
      setTimeout(() => {
        document.getElementById("manual-prompt")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar prompt Veo 3", { id: toastId });
    } finally {
      setVeo3Loading(false);
      setVeo3Stage("idle");
    }
  };

  const generatePrompt = () => {
    if (veo3Prompt) return veo3Prompt;
    const finalPose = pose === "Personalizado" && customPose ? customPose : pose;
    return `Vídeo UGC com avatar ${avatar?.name || state.avatarId || "—"}, cenário: ${state.scenarioTags.join(", ") || state.scenarioText || "padrão"}, estilo de câmera: ${state.cameraStyle}, estilo de vídeo: ${state.videoStyle}, formato: ${state.videoFormat}, modo: ${state.generationMode}, takes: ${numTakes}, modo de interação: ${interaction}, pose: ${finalPose}, melhorias: ${enhance.join(", ") || "nenhuma"}, proximidade ${state.proximity}%, energia ${state.energy}%, naturalidade ${state.naturalness}%, duração: ${state.duration}, voz ${state.voiceGender} ${state.voiceTone} energia ${state.voiceEnergy} estilo ${state.voiceStyle}. Roteiro: ${state.script || "(roteiro não definido)"}`;
  };

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
      setGeneratedJob(data.job);
      setPromptGenerated(true);
      setManualOpen(true);
      fireConfetti();
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err?.message || "Erro ao gerar UGC";
      if (msg.includes("Rate") || msg.includes("429")) toast.error("Muitas requisições. Aguarde.");
      else if (msg.includes("Payment") || msg.includes("402") || msg.includes("credit")) toast.error("Créditos esgotados.");
      else toast.error(msg);
    } finally {
      setGenerating(false);
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

  const handleCopyPrompt = () => {
    const text = veo3Prompts.length > 1
      ? veo3Prompts.map((p, i) => `--- TAKE ${i + 1} ---\n${p}`).join("\n\n")
      : generatePrompt();
    navigator.clipboard.writeText(text);
    fireConfetti();
    setSuccessOpen(true);
  };

  const handleCopyAvatarImage = async () => {
    if (!avatar?.img) { toast.error("Nenhum avatar selecionado"); return; }
    try {
      const res = await fetch(avatar.img);
      const blob = await res.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await (navigator.clipboard as any).write([new (window as any).ClipboardItem({ [blob.type]: blob })]);
        toast.success("Imagem do avatar copiada!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${avatar.name}.webp`; a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada!");
      }
    } catch { toast.error("Não foi possível copiar a imagem"); }
  };

  const wordCount = state.script.trim() ? state.script.trim().split(/\s+/).length : 0;

  // Aspect ratio for UGC preview
  const previewAspect = state.videoFormat === "16:9" ? "aspect-[16/9] w-80"
    : state.videoFormat === "1:1" ? "aspect-square w-56"
    : state.videoFormat === "3:4" ? "aspect-[3/4] w-48"
    : "aspect-[9/16] w-56";

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Criação Final</h2>
        <p className="text-muted-foreground">Mescle, configure a voz e gere seu vídeo com IA.</p>
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
              <div key={d.id} onClick={() => {
                updateState({ duration: d.id, numTakes: d.takes as 1|2|3|4|5, takes: ensureTakes(d.takes) });
              }} className={`${glassSelectable(sel)} p-4 text-center`}>
                <p className="font-bold text-sm">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TIPO DE CÂMERA */}
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

      {/* 4. ESTILO DO VÍDEO — 7 cards, sem badges */}
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

      {/* 5. MODO DE GERAÇÃO */}
      <div className={`${glassCard} p-6`}>
        <h3 className="font-bold tracking-tight mb-4">Modo de Geração</h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "automatico" as GenerationMode, label: "✨ Automático", desc: "A IA cria a sequência ideal", icon: ToggleRight },
            { id: "manual" as GenerationMode, label: "🎛 Manual", desc: "Configure cada take individualmente", icon: ToggleLeft },
          ]).map((m) => {
            const sel = state.generationMode === m.id;
            return (
              <div key={m.id} onClick={() => updateState({ generationMode: m.id })} className={`${glassSelectable(sel)} p-5`}>
                <p className="font-bold text-sm mb-1">{m.label}</p>
                <p className="text-[10px] text-muted-foreground leading-snug">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. AUTO TOGGLE — visible only when numTakes > 1 */}
      {numTakes > 1 && (
        <div className={`${glassCard} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold tracking-tight">Criar Automaticamente</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAutomatic
                  ? "Director gera sequência completa de takes"
                  : "Configure cada take manualmente"}
              </p>
            </div>
            <Switch checked={isAutomatic} onCheckedChange={setIsAutomatic} />
          </div>
        </div>
      )}

      {/* Modo Automático — Director + Storyboard */}
      {numTakes > 1 && isAutomatic && (
        <div className={`${glassCard} p-6`}>
          <h3 className="font-bold tracking-tight mb-1">Agente Director</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Gera automaticamente a sequência ideal de takes com cenários, câmeras e iluminação variados.
          </p>
          <Button onClick={handleDirectorGenerate} disabled={directorLoading}
            className="w-full rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600 h-11">
            {directorLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {directorLoading ? "Gerando sequência..." : storyboard ? "Regenerar Sequência" : "Gerar Sequência Automática"}
          </Button>

          <AnimatePresence>
            {storyboard && storyboard.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Storyboard Gerado</p>
                {storyboard.map((take, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/60">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold capitalize">{take.scene} · {take.cameraAngle.replace(/_/g, " ")} · {take.lighting.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{take.dialogue || "(sem diálogo sugerido)"}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">8s</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modo Manual — Accordion por take (when auto is off or manual mode) */}
      {((numTakes > 1 && !isAutomatic) || state.generationMode === "manual") && numTakes > 0 && (
        <div className={`${glassCard} p-6`}>
          <h3 className="font-bold tracking-tight mb-4">Configuração por Take</h3>
          <div className="space-y-3">
            {Array.from({ length: numTakes }).map((_, i) => {
              const take = ensureTakes(numTakes)[i];
              return <TakeAccordion key={i} index={i} take={take} onUpdate={(patch) => updateTake(i, patch)} />;
            })}
          </div>
        </div>
      )}

      {/* 7. CONFIGURAÇÃO DE VOZ */}
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
                    <button key={opt} onClick={() => updateState({ [key]: opt } as any)}
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

      {/* 8. DIÁLOGO */}
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

      {/* Mesclagem com IA */}
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

          {/* Gerar UGC */}
          <div className="pt-2">
            <button onClick={handleGenerateUGC} disabled={generating}
              className="group relative w-full h-12 rounded-xl overflow-hidden font-bold text-base text-white shadow-lg shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed">
              <span className="absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--primary)),#9333ea,#c084fc,#9333ea,hsl(var(--primary)))] bg-[length:300%_100%] animate-[shimmer_3s_linear_infinite]" />
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <span className="relative flex items-center justify-center gap-2">
                {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {generating ? "Gerando UGC..." : generatedJob ? "Regerar UGC" : "Gerar UGC"}
              </span>
            </button>
          </div>

          {/* UGC Preview */}
          <AnimatePresence>
            {(generating || generatedJob?.image_url) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-center pt-2">
                <div className={`relative ${previewAspect} rounded-2xl overflow-hidden border border-border/60 shadow-[0_12px_40px_hsl(var(--primary)/0.25)] bg-gradient-to-br from-primary/10 via-purple-500/10 to-background`}>
                  {generating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary">
                      <Loader2 size={28} className="animate-spin" /><p className="text-xs font-bold">Gerando UGC...</p>
                    </div>
                  ) : generatedJob?.image_url ? (
                    <motion.img key={generatedJob.id} src={generatedJob.image_url} alt="UGC"
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
      </div>

      {/* 9. Gerar Prompt Veo 3 */}
      <div className={`${glassCard} p-6 relative overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
        <div className="relative">
          <h3 className="font-bold tracking-tight mb-1">Gerar Prompt de Vídeo (Veo 3)</h3>
          <p className="text-xs text-muted-foreground mb-4">
            A IA analisa a imagem UGC e gera prompt(s) técnico(s) AAA em inglês — um por take.
          </p>
          {!generatedJob?.image_url && (
            <div className="mb-3 px-3 py-2 rounded-xl border border-dashed border-border/60 text-[11px] text-muted-foreground text-center">
              Gere a imagem UGC acima primeiro.
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
                {Array.isArray(veo3Analysis.optimizationFocus) && veo3Analysis.optimizationFocus.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {veo3Analysis.optimizationFocus.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 border border-primary/30 text-primary">{tag}</span>
                    ))}
                  </div>
                )}
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

      {/* Modo Manual — Prompt output com abas por take */}
      {promptGenerated && (
        <div id="manual-prompt" className={`${glassCard} overflow-hidden`}>
          <button onClick={() => setManualOpen((o) => !o)}
            className="w-full flex items-center justify-between p-5 hover:bg-accent/30 transition-colors">
            <div className="text-left">
              <h3 className="font-bold tracking-tight">
                {veo3Prompts.length > 1 ? `Prompts Veo 3 (${veo3Prompts.length} Takes)` : veo3Prompt ? "Prompt Veo 3 (Inglês)" : "Modo Manual — Copiar Prompt"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {veo3Prompt ? "Cole no Flow / Veo 3 e use a imagem UGC como seed." : "Use o prompt em ferramentas externas."}
              </p>
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
                  <Textarea readOnly
                    value={veo3Prompts.length > 1 ? veo3Prompts[activePromptTab] || "" : generatePrompt()}
                    className="min-h-[140px] rounded-xl bg-background/60 font-mono text-xs" />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => {
                      const text = veo3Prompts.length > 1 ? veo3Prompts[activePromptTab] : generatePrompt();
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

      {/* Success modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border/60 bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
          <div className="relative p-6 text-center">
            <button onClick={() => setSuccessOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"><X size={16} /></button>
            <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none" />
            <div className="relative">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/40 mb-4">
                <Sparkles size={28} className="text-white" />
              </motion.div>
              <h3 className="text-2xl font-black tracking-tight mb-1">Seu UGC está pronto! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-6">
                A IA gerou a imagem ultra-realista, o roteiro e os prompts. Tudo salvo na biblioteca.
              </p>
              {generatedJob?.image_url ? (
                <div className={`${previewAspect} mx-auto rounded-2xl overflow-hidden ring-2 ring-primary/40 shadow-lg shadow-primary/30 mb-5`}>
                  <img src={generatedJob.image_url} alt="UGC gerado" className="w-full h-full object-cover" />
                </div>
              ) : avatar?.img && (
                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden ring-2 ring-primary/40 shadow-lg shadow-primary/30 mb-5">
                  <img src={avatar.img} alt={avatar.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button variant="outline" onClick={() => {
                  if (generatedJob?.image_url) {
                    const a = document.createElement("a"); a.href = generatedJob.image_url;
                    a.download = `ugc-${generatedJob.id}.png`; a.target = "_blank"; a.click();
                  } else handleCopyAvatarImage();
                }} className="rounded-xl gap-2 h-11"><Download size={14} /> Baixar imagem</Button>
                <Button variant="outline" onClick={() => {
                  const text = generatedJob?.image_prompt || generatePrompt();
                  navigator.clipboard.writeText(text); toast.success("Prompt copiado!");
                }} className="rounded-xl gap-2 h-11"><Copy size={14} /> Copiar prompt</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { setSuccessOpen(false); navigate("/app/historico"); }}
                  className="rounded-xl gap-2 h-12"><History size={16} /> Biblioteca</Button>
                <Button asChild className="h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/40 gap-2 font-bold">
                  <a href="https://labs.google/flow" target="_blank" rel="noreferrer"><Rocket size={16} /> Abrir Flow</a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

function TakeAccordion({ index, take, onUpdate }: { index: number; take: TakeConfig; onUpdate: (patch: Partial<TakeConfig>) => void }) {
  const [open, setOpen] = useState(index === 0);
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
        <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={16} className="text-muted-foreground" /></motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Cenário" value={take.scene} options={sceneOptions} onChange={(v) => onUpdate({ scene: v as SceneType })} />
                <SelectField label="Ângulo de Câmera" value={take.cameraAngle} options={angleOptions} onChange={(v) => onUpdate({ cameraAngle: v as CameraAngle })} />
                <SelectField label="Iluminação" value={take.lighting} options={lightingOptions} onChange={(v) => onUpdate({ lighting: v as LightingType })} />
                <SelectField label="Interação" value={take.productInteraction} options={interactionOptions} onChange={(v) => onUpdate({ productInteraction: v as TakeConfig["productInteraction"] })} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Roteiro do Take (máx. 20 palavras)</p>
                <Textarea value={take.dialogue} onChange={(e) => onUpdate({ dialogue: e.target.value })}
                  placeholder="Roteiro para este take..." className="min-h-[60px] rounded-xl resize-none text-sm" />
                <p className="text-[10px] text-muted-foreground text-right mt-1">
                  {take.dialogue.trim() ? take.dialogue.trim().split(/\s+/).length : 0}/20 palavras
                </p>
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
