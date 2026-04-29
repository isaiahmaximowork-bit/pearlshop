import { useState } from "react";
import { ChevronDown, Camera, Hand, Box, User, Image as ImageIcon, Upload, Sparkles, Zap, ZoomIn, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { glassCard, glassSelectable } from "./glass";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { StudioState } from "@/pages/app/Studio";

interface Props {
  state: StudioState;
  updateState: (patch: Partial<StudioState>) => void;
}

const cameraStyles = [
  { id: "frente", label: "De Frente", desc: "Avatar olhando para câmera", icon: User },
  { id: "pov", label: "Mãos (POV)", desc: "Vista em primeira pessoa", icon: Hand },
  { id: "demo", label: "Demonstração", desc: "Foco no produto em uso", icon: Box },
];

const videoStyles = [
  { id: "ugc", label: "UGC Autêntico", desc: "Estilo natural, gravação caseira", icon: Camera },
  { id: "publi", label: "Publicitário", desc: "Visual polido e cinematográfico", icon: Sparkles },
  { id: "viral", label: "Viral TikTok", desc: "Cortes rápidos, dinâmico", icon: Zap },
];

const scenarioOptions = ["Quarto", "Estúdio", "Cozinha", "Banheiro", "Sala", "Externo", "Academia", "Carro"];

const avatars = {
  mulheres: Array.from({ length: 6 }, (_, i) => ({ id: `f-${i}`, name: `Avatar ${i + 1}` })),
  homens: Array.from({ length: 6 }, (_, i) => ({ id: `m-${i}`, name: `Avatar ${i + 1}` })),
  ia: Array.from({ length: 6 }, (_, i) => ({ id: `ai-${i}`, name: `IA ${i + 1}` })),
};

function Section({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${glassCard} overflow-hidden`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/30 transition-colors"
      >
        <div>
          <h3 className="font-bold tracking-tight">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-6 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StudioStepConfig({ state, updateState }: Props) {
  const toggleScenario = (tag: string) => {
    const has = state.scenarioTags.includes(tag);
    updateState({
      scenarioTags: has ? state.scenarioTags.filter((t) => t !== tag) : [...state.scenarioTags, tag],
    });
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Configure seu vídeo</h2>
        <p className="text-muted-foreground">Personalize cada detalhe da geração com IA.</p>
      </div>

      {/* Camera style */}
      <Section title="Estilo de Câmera" description="Escolha o ângulo principal">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cameraStyles.map((c) => {
            const Icon = c.icon;
            const sel = state.cameraStyle === c.id;
            return (
              <div
                key={c.id}
                onClick={() => updateState({ cameraStyle: c.id })}
                className={`${glassSelectable(sel)} p-5 text-center`}
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                    sel ? "bg-gradient-to-br from-primary to-purple-600 text-white" : "bg-accent text-foreground"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <p className="font-bold text-sm">{c.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Avatar */}
      <Section title="Avatar para o Vídeo" description="Escolha quem vai apresentar">
        <div className="flex flex-wrap gap-2 mb-4">
          {(["mulheres", "homens", "ia"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => updateState({ avatarCategory: cat })}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                state.avatarCategory === cat
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30"
                  : "bg-card/60 backdrop-blur-md border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "ia" ? "Modelos IA" : cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {avatars[state.avatarCategory].map((a) => {
            const sel = state.avatarId === a.id;
            return (
              <div
                key={a.id}
                onClick={() => updateState({ avatarId: a.id })}
                className={`${glassSelectable(sel)} p-2`}
              >
                <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <User size={28} className="text-primary/60" />
                </div>
                <p className="text-[10px] font-semibold text-center mt-2 truncate">{a.name}</p>
              </div>
            );
          })}
          <div className="p-2 rounded-2xl border border-dashed border-border/60 hover:border-primary/60 cursor-pointer transition-colors flex flex-col items-center justify-center text-center">
            <div className="aspect-square w-full rounded-xl bg-accent/40 flex items-center justify-center">
              <Upload size={22} className="text-muted-foreground" />
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground mt-2">Personalizado</p>
          </div>
        </div>
      </Section>

      {/* Cenário */}
      <Section title="Cenário" description="Defina o ambiente do vídeo">
        <div className="flex flex-wrap gap-2 mb-4">
          {scenarioOptions.map((tag) => {
            const sel = state.scenarioTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleScenario(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md transition-all ${
                  sel
                    ? "bg-primary/20 border border-primary text-primary shadow-[0_4px_16px_hsl(var(--primary)/0.25)]"
                    : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-xl gap-2 justify-start h-11">
            <ImageIcon size={16} /> Enviar imagem do cenário
          </Button>
          <Input
            value={state.scenarioText}
            onChange={(e) => updateState({ scenarioText: e.target.value })}
            placeholder="Ou descreva o cenário em texto..."
            className="rounded-xl h-11"
          />
        </div>
      </Section>

      {/* Video style */}
      <Section title="Estilo do Vídeo" description="Tom geral da produção">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {videoStyles.map((v) => {
            const Icon = v.icon;
            const sel = state.videoStyle === v.id;
            return (
              <div
                key={v.id}
                onClick={() => updateState({ videoStyle: v.id })}
                className={`${glassSelectable(sel)} p-5`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    sel ? "bg-gradient-to-br from-primary to-purple-600 text-white" : "bg-accent"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <p className="font-bold text-sm">{v.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Performance */}
      <Section title="Ajustes de Performance" description="Refine a entrega final">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ZoomIn size={16} className="text-primary" />
                <p className="text-sm font-bold">Proximidade</p>
              </div>
              <span className="text-xs text-muted-foreground">{state.proximity}%</span>
            </div>
            <Slider
              value={[state.proximity]}
              onValueChange={([v]) => updateState({ proximity: v })}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>Mais distante</span>
              <span>Mais próximo</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                <p className="text-sm font-bold">Energia</p>
              </div>
              <span className="text-xs text-muted-foreground">{state.energy}%</span>
            </div>
            <Slider
              value={[state.energy]}
              onValueChange={([v]) => updateState({ energy: v })}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>Calmo</span>
              <span>Vibrante</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
