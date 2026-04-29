import { useState } from "react";
import { Wand2, Copy, ChevronDown, ExternalLink, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { glassCard, glassSelectable } from "./glass";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { StudioState } from "@/pages/app/Studio";

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

const interactionModes = ["Segurando produto", "Apontando", "Aplicando", "Demonstrando"];
const avatarPoses = ["Em pé", "Sentado", "Caminhando", "Closeup"];
const enhancements = ["Remover fundo", "Iluminação cinematográfica", "Cores vibrantes"];

export function StudioStepFinal({ state, updateState }: Props) {
  const [merging, setMerging] = useState(false);
  const [merged, setMerged] = useState(false);
  const [interaction, setInteraction] = useState(interactionModes[0]);
  const [pose, setPose] = useState(avatarPoses[0]);
  const [enhance, setEnhance] = useState<string[]>([]);
  const [manualOpen, setManualOpen] = useState(false);

  const handleMerge = () => {
    setMerging(true);
    setTimeout(() => {
      setMerging(false);
      setMerged(true);
    }, 1500);
  };

  const generatePrompt = () => {
    return `Vídeo UGC com avatar ${state.avatarId || "—"}, cenário: ${state.scenarioTags.join(", ") || state.scenarioText || "padrão"}, estilo de câmera: ${state.cameraStyle}, estilo de vídeo: ${state.videoStyle}, proximidade ${state.proximity}%, energia ${state.energy}%, duração: ${state.duration}, voz ${state.voiceGender} ${state.voiceTone} energia ${state.voiceEnergy} estilo ${state.voiceStyle}. Roteiro: ${state.script || "(roteiro não definido)"}`;
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
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 size={36} className="animate-spin" />
              <p className="text-sm font-bold">Mesclando com IA...</p>
            </div>
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
        </div>

        <Button
          onClick={handleMerge}
          disabled={merging}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30 gap-2"
        >
          {merging ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {merging ? "Gerando..." : merged ? "Regerar imagem" : "Mesclar com IA"}
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <SelectControl label="Modo de Interação" value={interaction} onChange={setInteraction} options={interactionModes} />
          <SelectControl label="Pose do Avatar" value={pose} onChange={setPose} options={avatarPoses} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Melhorias</p>
            <div className="flex flex-wrap gap-1.5">
              {enhancements.map((e) => {
                const sel = enhance.includes(e);
                return (
                  <button
                    key={e}
                    onClick={() => setEnhance(sel ? enhance.filter((x) => x !== e) : [...enhance, e])}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                      sel
                        ? "bg-primary/20 border border-primary text-primary"
                        : "bg-card/60 border border-border/60 text-muted-foreground"
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

      {/* Modo manual */}
      <div className={`${glassCard} overflow-hidden`}>
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
                  className="min-h-[120px] rounded-xl bg-background/60 font-mono text-xs"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatePrompt());
                      toast.success("Prompt copiado!");
                    }}
                    className="rounded-xl gap-2"
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
    </div>
  );
}

function SelectControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 px-3 text-sm font-semibold focus:outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
