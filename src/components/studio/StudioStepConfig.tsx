import { useState } from "react";
import { ChevronDown, User, Upload, Zap, ZoomIn, Gauge, Move } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { glassCard, glassSelectable } from "./glass";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { StudioState } from "@/pages/app/Studio";
import { handleSelectAndScroll } from "./useAutoScrollNext";
import { avatarsByCategory as avatars } from "./avatars";
import type { CameraMovement } from "./types";

interface Props {
  state: StudioState;
  updateState: (patch: Partial<StudioState>) => void;
}

const cameraMovementOptions: { id: CameraMovement; label: string }[] = [
  { id: "estatico", label: "Estático" },
  { id: "handheld_suave", label: "Handheld Suave" },
  { id: "handheld_energetico", label: "Handheld Energético" },
  { id: "zoom_lento", label: "Zoom Lento" },
];

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
    <div data-studio-section className={`${glassCard} overflow-hidden`}>
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
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Configure seu vídeo</h2>
        <p className="text-muted-foreground">Personalize cada detalhe da geração com IA.</p>
      </div>

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
              {cat === "ia" ? "Meus Avatares" : cat}
            </button>
          ))}
        </div>
        {state.avatarCategory === "ia" && avatars.ia.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent/40 flex items-center justify-center mb-3">
              <Upload size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-bold mb-1">Você ainda não tem avatares personalizados</p>
            <p className="text-xs text-muted-foreground mb-4">
              Crie um avatar com seu rosto ou de alguém autorizado para usar nos seus vídeos.
            </p>
            <Button disabled className="rounded-xl gap-2 opacity-60 cursor-not-allowed">
              <Upload size={16} /> Criar meu avatar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {avatars[state.avatarCategory].map((a) => {
              const sel = state.avatarId === a.id;
              return (
                <div
                  key={a.id}
                  onClick={(e) => { 
                    updateState({ avatarId: a.id }); 
                    // Use a slight delay to ensure state update doesn't cause a layout shift mid-scroll
                    setTimeout(() => handleSelectAndScroll(e), 50);
                  }}
                  className={`${glassSelectable(sel)} p-2`}
                >
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                    {a.img ? (
                      <img src={a.img} alt={a.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-primary/60" />
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-center mt-2 truncate">{a.name}</p>
                </div>
              );
            })}
            <div className="p-2 rounded-2xl border border-dashed border-border/60 opacity-50 cursor-not-allowed transition-colors flex flex-col items-center justify-center text-center">
              <div className="aspect-square w-full rounded-xl bg-accent/40 flex items-center justify-center">
                <Upload size={22} className="text-muted-foreground" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground mt-2">Personalizado em breve</p>
            </div>
          </div>
        )}
      </Section>

      {/* Performance */}
      <Section title="Ajustes de Performance" description="Refine a entrega final">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proximidade */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ZoomIn size={16} className="text-primary" />
                <p className="text-sm font-bold">Proximidade da Câmera</p>
              </div>
              <span className="text-xs text-muted-foreground">{state.proximity}%</span>
            </div>
            <Slider value={[state.proximity]} onValueChange={([v]) => updateState({ proximity: v })} max={100} step={1} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>Mais distante</span><span>Mais próximo</span>
            </div>
          </div>

          {/* Energia */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                <p className="text-sm font-bold">Energia do Avatar</p>
              </div>
              <span className="text-xs text-muted-foreground">{state.energy}%</span>
            </div>
            <Slider value={[state.energy]} onValueChange={([v]) => updateState({ energy: v })} max={100} step={1} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>Calmo</span><span>Vibrante</span>
            </div>
          </div>

          {/* Naturalidade (NOVO) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-primary" />
                <p className="text-sm font-bold">Naturalidade</p>
              </div>
              <span className="text-xs text-muted-foreground">{state.naturalness}%</span>
            </div>
            <Slider value={[state.naturalness]} onValueChange={([v]) => updateState({ naturalness: v })} max={100} step={1} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>Estilizado</span><span>Ultra-realista</span>
            </div>
          </div>

          {/* Movimento de Câmera (NOVO) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Move size={16} className="text-primary" />
              <p className="text-sm font-bold">Movimento de Câmera</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cameraMovementOptions.map((opt) => {
                const sel = state.cameraMovement === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateState({ cameraMovement: opt.id })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      sel
                        ? "bg-primary/20 border border-primary text-primary shadow-[0_4px_16px_hsl(var(--primary)/0.25)]"
                        : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
