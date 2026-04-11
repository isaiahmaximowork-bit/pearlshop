import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Package, Pencil, ExternalLink, Globe, Lock, Unlock, RefreshCw, ShieldCheck, CheckCircle2, Circle, Video, ImageIcon, ShoppingBag } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import defaultPreview from "@/assets/store-default-preview.png";

interface Store {
  id: string;
  store_name: string;
  slug: string;
  preview_cache: string | null;
  access_code: string;
  is_public: boolean;
}

const Builder = () => {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenConfirmed, setRegenConfirmed] = useState(false);

  // UI-only task states
  const [tasks] = useState({
    affiliatedProducts: 0,
    logoChanged: false,
    videoPublished: false,
  });

  useEffect(() => {
    if (!user) return;
    fetchStore();
  }, [user]);

  const fetchStore = async () => {
    const { data } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setStore(data as Store);
      setStoreName(data.store_name);
      setSlug(data.slug);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    if (store) {
      await supabase
        .from("stores")
        .update({ store_name: storeName, slug })
        .eq("id", store.id);
    } else {
      await supabase
        .from("stores")
        .insert({ user_id: user.id, store_name: storeName, slug });
    }

    await fetchStore();
    setEditing(false);
    setSaving(false);
  };

  const handleRegenerateCode = async () => {
    if (!store) return;
    const newCode = Math.random().toString(36).substring(2, 7);
    await supabase
      .from("stores")
      .update({ access_code: newCode } as any)
      .eq("id", store.id);
    await fetchStore();
    setRegenConfirmed(false);
    toast.success("Código de acesso regenerado com sucesso!");
  };

  const canGoPublic = tasks.affiliatedProducts >= 3 && tasks.logoChanged && tasks.videoPublished;

  const previewImage = store?.preview_cache || defaultPreview;

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">Monte e personalize sua loja virtual</p>
      </div>

      {/* Store Card - Larger */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left - Info */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-5">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome da Loja</Label>
                  <Input
                    id="store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Minha Loja"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">pearlshop.io/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="minha-loja"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving || !storeName || !slug} size="sm">
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setStoreName(store?.store_name || ""); setSlug(store?.slug || ""); }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loja Atual</span>
                </div>
                <h2 className="text-2xl font-black text-foreground">
                  {store?.store_name || "Sua loja ainda não foi criada"}
                </h2>
                {store?.slug ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <ExternalLink size={14} />
                    pearlshop.io/{store.slug}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Configure o nome e slug da sua loja</p>
                )}

                {store && (
                  <div className="flex items-center gap-2 pt-1">
                    {store.is_public ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <Unlock size={12} /> Pública
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        <Lock size={12} /> Privada
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {!editing && (
              <div className="flex flex-wrap gap-2 pt-2">
                {store ? (
                  <>
                    <Button size="sm" className="gap-2">
                      <Pencil size={14} /> Editar Minha Loja
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => setEditing(true)}>
                      Configurações
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="gap-2" onClick={() => setEditing(true)}>
                    Criar Minha Loja
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right - Preview */}
          <div className="flex items-center justify-center p-6 md:p-8">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-border shadow-sm flex-shrink-0">
              <img
                src={previewImage}
                alt="Preview da loja"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Access Code Section */}
      {store && (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">Código de Acesso</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Sua loja é privada. Visitantes precisarão digitar este código para acessá-la.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <InputOTP maxLength={5} value={store.access_code} disabled>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw size={14} /> Regenerar Código
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerar código de acesso?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <span className="block">
                      Ao trocar a senha, usuários que já possuem a senha atual irão perder o acesso à loja.
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={regenConfirmed}
                        onCheckedChange={(checked) => setRegenConfirmed(!!checked)}
                      />
                      <span className="text-sm text-foreground">Eu entendo</span>
                    </label>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRegenConfirmed(false)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction disabled={!regenConfirmed} onClick={handleRegenerateCode}>
                    Regenerar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Privacy / Go Public Section */}
      {store && !store.is_public && (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock size={18} className="text-primary" />
              <h3 className="text-base font-bold text-foreground">Tornar Loja Pública</h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{[tasks.affiliatedProducts >= 3, tasks.logoChanged, tasks.videoPublished].filter(Boolean).length}/3 concluídas</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete as tarefas abaixo para desbloquear o acesso público à sua loja.
          </p>

          <div className="space-y-3">
            {/* Task 1 */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${tasks.affiliatedProducts >= 3 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/30'}`}>
              {tasks.affiliatedProducts >= 3 ? (
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Afiliar-se a 3 produtos</p>
                <p className="text-xs text-muted-foreground">Adicione pelo menos 3 produtos à sua loja</p>
              </div>
              <span className="text-xs font-bold text-muted-foreground flex-shrink-0">{tasks.affiliatedProducts}/3</span>
            </div>

            {/* Task 2 */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${tasks.logoChanged ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/30'}`}>
              {tasks.logoChanged ? (
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Alterar a logotipo</p>
                <p className="text-xs text-muted-foreground">Personalize o logo da sua loja</p>
              </div>
              <ImageIcon size={16} className="text-muted-foreground flex-shrink-0" />
            </div>

            {/* Task 3 */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${tasks.videoPublished ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/30'}`}>
              {tasks.videoPublished ? (
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Publicar vídeo com produto afiliado</p>
                <p className="text-xs text-muted-foreground">Use a PearlShop.io para publicar um vídeo com um produto</p>
              </div>
              <Video size={16} className="text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          <Button disabled={!canGoPublic} className="gap-2 w-full sm:w-auto">
            <Unlock size={14} /> Tornar Pública
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Eye size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visitas no Site</p>
              <p className="text-2xl font-black text-foreground">0</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Total de visitas na sua loja</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visitas de Produtos</p>
              <p className="text-2xl font-black text-foreground">0</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Visualizações em páginas de produtos</p>
        </div>
      </div>
    </div>
  );
};

export default Builder;
