import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Copy, Download, Sparkles, Trash2, ImageIcon, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type MediaJob = {
  id: string;
  product_name: string | null;
  avatar_name: string | null;
  pose: string | null;
  status: string;
  image_url: string | null;
  image_storage_key: string | null;
  master_prompt: string | null;
  image_prompt: string | null;
  script_prompt: any;
  veo3_prompt: string | null;
  error_message: string | null;
  created_at: string;
};

const Historico = () => {
  const [jobs, setJobs] = useState<MediaJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaJob | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_jobs")
        .select("id, product_name, avatar_name, pose, status, image_url, image_storage_key, master_prompt, image_prompt, script_prompt, veo3_prompt, error_message, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar histórico");
    } else {
      setJobs((data as MediaJob[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (job: MediaJob) => {
    if (job.image_storage_key) await supabase.storage.from("ugc-media").remove([job.image_storage_key]);
    const { error } = await supabase.from("media_jobs").delete().eq("id", job.id);
    if (error) return toast.error("Não foi possível excluir");
    setJobs((s) => s.filter((j) => j.id !== job.id));
    setSelected(null);
    toast.success("Geração excluída");
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5 px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Biblioteca</h1>
          <p className="text-sm text-muted-foreground">Suas mídias UGC criadas com IA</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-border/60 bg-card/30">
          <ImageIcon size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">Nenhuma geração ainda</p>
          <p className="text-sm text-muted-foreground">Vá ao Studio e crie seu primeiro UGC.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {jobs.map((job) => (
            <motion.button
              key={job.id}
              onClick={() => setSelected(job)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group rounded-2xl overflow-hidden border border-border/60 bg-card/40 backdrop-blur-md text-left aspect-[9/16]"
            >
              {job.status === "completed" && job.image_url ? (
                <img src={job.image_url} alt={job.product_name || "UGC"} className="absolute inset-0 w-full h-full object-cover" />
              ) : job.status === "failed" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-3 text-center">
                  <AlertCircle size={24} />
                  <p className="text-[10px] mt-2 font-bold">Falha</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                  <Loader2 size={24} className="animate-spin" />
                  <p className="text-[10px] mt-2 font-bold">Processando</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                <p className="text-[11px] font-bold text-white truncate">{job.product_name || "Sem produto"}</p>
                <p className="text-[9px] text-white/70 flex items-center gap-1">
                  <Clock size={9} /> {new Date(job.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl rounded-2xl border-border/60 bg-background/95 backdrop-blur-xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {selected && (
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight">{selected.product_name || "UGC"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selected.avatar_name && `Avatar: ${selected.avatar_name} · `}
                    {new Date(selected.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(selected)} className="rounded-xl text-destructive">
                  <Trash2 size={16} />
                </Button>
              </div>

              {selected.status === "completed" && selected.image_url && (
                <div className="flex justify-center">
                  <div className="w-64 aspect-[9/16] rounded-2xl overflow-hidden border border-border/60 shadow-xl">
                    <img src={selected.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {selected.status === "failed" && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
                  <p className="font-bold text-destructive mb-1">Falha na geração</p>
                  <p className="text-xs text-muted-foreground">{selected.error_message || "Erro desconhecido"}</p>
                </div>
              )}

              {selected.master_prompt && (
                <PromptBlock label="Master Prompt (Diretor Criativo)" value={selected.master_prompt} onCopy={(v) => copy(v, "Master Prompt")} />
              )}
              {selected.image_prompt && (
                <PromptBlock label="Prompt de Imagem (final)" value={selected.image_prompt} onCopy={(v) => copy(v, "Prompt de Imagem")} />
              )}
              {selected.script_prompt && (
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Roteiro</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.script_prompt.script}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selected.script_prompt.voiceTone && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">{selected.script_prompt.voiceTone}</span>
                    )}
                    {selected.script_prompt.suggestedMusic && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold">🎵 {selected.script_prompt.suggestedMusic}</span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copy(selected.script_prompt.script, "Roteiro")} className="rounded-xl gap-1.5 mt-1">
                    <Copy size={12} /> Copiar roteiro
                  </Button>
                </div>
              )}

              {selected.veo3_prompt && (
                <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Prompt Final — Veo 3 / Flow</p>
                  </div>
                  <p className="text-xs font-mono whitespace-pre-wrap break-words text-foreground/80">{selected.veo3_prompt}</p>
                  <Button size="sm" onClick={() => copy(selected.veo3_prompt!, "Prompt Veo 3")} className="rounded-xl gap-1.5 mt-1 bg-gradient-to-r from-primary to-purple-600">
                    <Copy size={12} /> Copiar Prompt Final
                  </Button>
                </div>
              )}

              {selected.image_url && (
                <Button onClick={() => downloadImage(selected.image_url!, `ugc-${selected.id}.png`)} className="w-full rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600">
                  <Download size={14} /> Baixar imagem
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function PromptBlock({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <Button size="sm" variant="outline" onClick={() => onCopy(value)} className="rounded-xl gap-1.5 h-7 text-xs">
          <Copy size={12} /> Copiar
        </Button>
      </div>
      <p className="text-xs font-mono whitespace-pre-wrap break-words text-foreground/80">{value}</p>
    </div>
  );
}

export default Historico;
