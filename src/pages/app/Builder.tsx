import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, ShoppingBag, Package, Pencil, ExternalLink, Globe } from "lucide-react";
import defaultPreview from "@/assets/store-default-preview.png";

interface Store {
  id: string;
  store_name: string;
  slug: string;
  preview_cache: string | null;
}

const Builder = () => {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

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

  const previewImage = store?.preview_cache || defaultPreview;

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">Monte e personalize sua loja virtual</p>
      </div>

      {/* Store Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left - Info */}
          <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4">
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
                <h2 className="text-xl font-black text-foreground">
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
          <div className="flex items-center justify-center p-5 md:p-6">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border border-border shadow-sm flex-shrink-0">
              <img
                src={previewImage}
                alt="Preview da loja"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

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
