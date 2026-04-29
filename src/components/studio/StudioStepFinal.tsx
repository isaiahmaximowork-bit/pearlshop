import { useState } from "react";
import { Wand2, Copy, ChevronDown, ExternalLink, Sparkles, Image as ImageIcon, Loader2, Download, X, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { glassCard, glassSelectable } from "./glass";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { StudioState } from "@/pages/app/Studio";
import { findAvatar } from "./avatars";

interface Props {
  state: StudioState;
  updateState: (patch: Partial<StudioState>) => void;
}

const durations = [
  { id: "1take", label: "1 Take", sub: "8s" },
  { id: "2takes", label: "2 Takes", sub: "16s" },
  { id: "3takes", label: "3 Takes", sub: "24s" },
  { id: "4takes", label: "4 Takes", sub: "32s" },
];

const voiceOptions = {
  voiceGender: { label: "Gênero", options: ["feminino", "masculino"] },
  voiceTone: { label: "Tom de Voz", options: ["natural", "expressivo", "calmo", "intenso"] },
  voiceEnergy: { label: "Energia", options: ["baixa", "media", "alta"] },
  voiceStyle: { label: "Estilo", options: ["conversacional", "narrativo", "publicitario"] },
};

const interactionModes = [
  "Vestindo o produto",
  "Segurando o produto",
  "Selfie no espelho",
  "Selfie",
];
const avatarPoses = ["De frente", "De lado", "3/4", "Sentado(a)", "Andando", "Personalizado"];
const enhancements = [
  "Luz natural",
  "Ultra-nitidez 8K",
  "Mãos perfeitas",
  "Brilho natural",
  "Tecido real",
  "Cabelo real",
  "Anti-IA",
  "Profundidade",
  "Grão foto",
];

export function StudioStepFinal({ state, updateState }: Props) {
  const [merging, setMerging] = useState(false);
  const [merged, setMerged] = useState(false);
  const [interaction, setInteraction] = useState(interactionModes[0]);
  const [pose, setPose] = useState(avatarPoses[0]);
  const [customPose, setCustomPose] = useState("");
  const [enhance, setEnhance] = useState<string[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [promptGenerated, setPromptGenerated] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const avatar = findAvatar(state.avatarId);

  const handleMerge = () => {
    setMerging(true);
    setTimeout(() => {
      setMerging(false);
      setMerged(true);
    }, 1500);
  };

  const generatePrompt = () => {
    const finalPose = pose === "Personalizado" && customPose ? customPose : pose;
    return `Vídeo UGC com avatar ${avatar?.name || state.avatarId || "—"}, cenário: ${state.scenarioTags.join(", ") || state.scenarioText || "padrão"}, estilo de câmera: ${state.cameraStyle}, estilo de vídeo: ${state.videoStyle}, modo de interação: ${interaction}, pose: ${finalPose}, melhorias: ${enhance.join(", ") || "nenhuma"}, proximidade ${state.proximity}%, energia ${state.energy}%, duração: ${state.duration}, voz ${state.voiceGender} ${state.voiceTone} energia ${state.voiceEnergy} estilo ${state.voiceStyle}. Roteiro: ${state.script || "(roteiro não definido)"}`;
  };

  const handleGeneratePrompt = () => {
    setPromptGenerated(true);
    setManualOpen(true);
    setTimeout(() => {
      document.getElementById("manual-prompt")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ["#a855f7", "#7c3aed", "#c084fc", "#ffffff"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt());
    fireConfetti();
    setSuccessOpen(true);
  };

  const handleCopyAvatarImage = async () => {
    if (!avatar?.img) {
      toast.error("Nenhum avatar selecionado");
      return;
    }
    try {
      const res = await fetch(avatar.img);
      const blob = await res.blob();
      // try clipboard image; fallback to download
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await (navigator.clipboard as any).write([
          new (window as any).ClipboardItem({ [blob.type]: blob }),
        ]);
        toast.success("Imagem do avatar copiada!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${avatar.name}.webp`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada!");
      }
    } catch {
      toast.error("Não foi possível copiar a imagem");
    }
  };

  const handleCopyPromptOnly = () => {
    navigator.clipboard.writeText(generatePrompt());
    toast.success("Prompt copiado!");
  };

  const wordCount = state.script.trim() ? state.script.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Criação Final</h2>
        <p className="text-muted-foreground">Mescle, configure a voz e gere seu vídeo com IA.</p>
      </div>

      {/* Reference image */}
      <div className={`${glassCard} p-6`}>
        <h3 className="font-bold tracking-tight mb-1">Imagem de Referência</h3>
        <p className="text-xs text-muted-foreground mb-5">Mesclagem com IA do avatar + produto + cenário.</p>

        <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-background border border-border/60 flex items-center justify-center mb-4 overflow-hidden relative">
          {merging ? (
            <div className="flex flex-col items-center gap-3 text-primary z-10">
              <Loader2 size={36} className="animate-spin" />
              <p className="text-sm font-bold">Mesclando com IA...</p>
            </div>
          ) : merged && avatar?.img ? (
            <motion.img
              key={avatar.id}
              src={avatar.img}
              alt={avatar.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
            />
          ) : merged ? (
            <div className="flex flex-col items-center gap-3 text-primary">
              <Sparkles size={36} />
              <p className="text-sm font-bold">Imagem gerada com sucesso</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ImageIcon size={36} />
              <p className="text-sm">Clique em "Mesclar com IA" para gerar</p>
            </div>
          )}
          {merged && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-border/60 text-[10px] font-bold flex items-center gap-1.5">
              <Sparkles size={10} className="text-primary" /> Avatar mesclado
            </div>
          )}
        </div>

        <Button
          onClick={handleMerge}
          disabled={merging}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30 gap-2"
        >
          {merging ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {merging ? "Gerando..." : merged ? "Regerar imagem" : "Mesclar com IA"}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center mt-3">
          Avatar + Produto + Cenário → foto realista
        </p>

        <div className="space-y-5 mt-6">
          <PillGroup
            label="Modo de interação"
            options={interactionModes}
            value={interaction}
            onChange={setInteraction}
          />

          <div>
            <PillGroup label="Pose do avatar" options={avatarPoses} value={pose} onChange={setPose} />
            {pose === "Personalizado" && (
              <input
                value={customPose}
                onChange={(e) => setCustomPose(e.target.value)}
                placeholder="Descreva a pose desejada..."
                className="w-full mt-3 h-10 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 px-3 text-sm focus:outline-none focus:border-primary"
              />
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Melhorias opcionais
            </p>
            <div className="flex flex-wrap gap-1.5">
              {enhancements.map((e) => {
                const sel = enhance.includes(e);
                return (
                  <button
                    key={e}
                    onClick={() => setEnhance(sel ? enhance.filter((x) => x !== e) : [...enhance, e])}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      sel
                        ? "bg-primary/20 border border-primary text-primary shadow-[0_4px_16px_hsl(var(--primary)/0.25)]"
                        : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Duração */}
      <div className={`${glassCard} p-6`}>
        <h3 className="font-bold tracking-tight mb-4">Duração do Vídeo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {durations.map((d) => {
            const sel = state.duration === d.id;
            return (
              <div
                key={d.id}
                onClick={() => updateState({ duration: d.id })}
                className={`${glassSelectable(sel)} p-4 text-center`}
              >
                <p className="font-bold text-sm">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voz */}
      <div className={`${glassCard} p-6`}>
        <h3 className="font-bold tracking-tight mb-4">Configuração de Voz</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {(Object.entries(voiceOptions) as [keyof typeof voiceOptions, { label: string; options: string[] }][]).map(
            ([key, cfg]) => (
              <div key={key}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {cfg.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cfg.options.map((opt) => {
                    const sel = (state as any)[key] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => updateState({ [key]: opt } as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                          sel
                            ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/30"
                            : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Diálogo */}
      <div className={`${glassCard} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold tracking-tight">Diálogo (Roteiro)</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateState({ script: "Olá! Hoje quero te mostrar esse produto incrível que mudou minha rotina..." })}
            className="rounded-xl gap-2"
          >
            <Wand2 size={14} /> Preencher com IA
          </Button>
        </div>
        <Textarea
          value={state.script}
          onChange={(e) => updateState({ script: e.target.value })}
          placeholder="Escreva o roteiro do vídeo aqui..."
          className="min-h-[140px] rounded-xl resize-none"
        />
        <p className="text-[10px] text-muted-foreground text-right mt-2">{wordCount} palavras</p>
      </div>

      {/* Gerar Vídeo (Prompt) */}
      <div className={`${glassCard} p-6 relative overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
        <div className="relative">
          <h3 className="font-bold tracking-tight mb-1">Pronto para gerar?</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Vamos montar o prompt definitivo para você usar no seu gerador de vídeo favorito.
          </p>
          <Button
            onClick={handleGeneratePrompt}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30 gap-2 text-base font-bold"
          >
            <Sparkles size={18} /> Gerar vídeo
          </Button>
          <AnimatePresence>
            {promptGenerated && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-primary text-center mt-3 font-semibold flex items-center justify-center gap-1.5"
              >
                <Sparkles size={12} /> Prompt gerado — confira abaixo
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modo manual */}
      <div id="manual-prompt" className={`${glassCard} overflow-hidden`}>
        <button
          onClick={() => setManualOpen((o) => !o)}
          className="w-full flex items-center justify-between p-5 hover:bg-accent/30 transition-colors"
        >
          <div className="text-left">
            <h3 className="font-bold tracking-tight">Modo Manual — Copiar Prompt</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Use o prompt em ferramentas externas.</p>
          </div>
          <motion.div animate={{ rotate: manualOpen ? 180 : 0 }}>
            <ChevronDown size={18} className="text-muted-foreground" />
          </motion.div>
        </button>
        <AnimatePresence>
          {manualOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="px-5 pb-6 space-y-3">
                <Textarea
                  readOnly
                  value={generatePrompt()}
                  className="min-h-[140px] rounded-xl bg-background/60 font-mono text-xs"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleCopyPrompt}
                    className="rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600"
                  >
                    <Copy size={14} /> Copiar Prompt
                  </Button>
                  <Button variant="outline" size="sm" asChild className="rounded-xl gap-2">
                    <a href="https://gemini.google.com" target="_blank" rel="noreferrer">
                      <ExternalLink size={14} /> Abrir Gemini
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="rounded-xl gap-2">
                    <a href="https://labs.google/flow" target="_blank" rel="noreferrer">
                      <ExternalLink size={14} /> Abrir Flow
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border/60 bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
          <div className="relative p-6 text-center">
            <button
              onClick={() => setSuccessOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
            <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/40 mb-4"
              >
                <Sparkles size={28} className="text-white" />
              </motion.div>
              <h3 className="text-2xl font-black tracking-tight mb-1">Você criou seu prompt! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Agora copie a imagem do avatar, cole no Flow junto com o prompt e gere seu vídeo.
              </p>

              {avatar?.img && (
                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden ring-2 ring-primary/40 shadow-lg shadow-primary/30 mb-5">
                  <img src={avatar.img} alt={avatar.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  variant="outline"
                  onClick={handleCopyAvatarImage}
                  className="rounded-xl gap-2 h-11"
                >
                  <Download size={14} /> Copiar imagem
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyPromptOnly}
                  className="rounded-xl gap-2 h-11"
                >
                  <Copy size={14} /> Copiar prompt
                </Button>
              </div>

              <Button
                asChild
                className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/40 gap-2 text-base font-bold"
              >
                <a href="https://labs.google/flow" target="_blank" rel="noreferrer">
                  <Rocket size={20} /> Abrir Flow agora
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const sel = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                sel
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/30"
                  : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
