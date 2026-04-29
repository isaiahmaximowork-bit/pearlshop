import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, RotateCcw, Package, Search, X } from "lucide-react";
import { glassCard, glassSelectable } from "./glass";
import type { StudioState } from "@/pages/app/Studio";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Props {
  state: StudioState;
  updateState: (patch: Partial<StudioState>) => void;
}

export function StudioStepProduct({ state, updateState }: Props) {
  const { user } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["studio-user-products", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_products")
        .select("*, catalog_products(*)")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const selected = products.find((p: any) => p.id === state.productId);

  useEffect(() => {
    if (!state.productId && products.length > 0) {
      // auto-open picker when no product yet
      setPickerOpen(true);
    }
  }, [products.length, state.productId]);

  const filtered = products.filter((p: any) =>
    (p.catalog_products?.product_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2">Selecione um produto</h2>
        <p className="text-muted-foreground">
          Escolha o produto que será o protagonista do seu vídeo gerado por IA.
        </p>
      </div>

      {selected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${glassCard} max-w-2xl mx-auto p-8`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10 shrink-0">
              {selected.catalog_products?.image_url && (
                <img
                  src={selected.catalog_products.image_url}
                  alt={selected.catalog_products.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                {selected.category || "Produto"}
              </p>
              <h3 className="text-2xl font-bold tracking-tight mb-4">
                {selected.catalog_products?.product_name}
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                  className="rounded-xl gap-2"
                >
                  <Edit3 size={14} /> Alterar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateState({ productId: null })}
                  className="rounded-xl gap-2"
                >
                  <RotateCcw size={14} /> Começar do zero
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateState({ productId: null })}
                  className="rounded-xl gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} /> Remover
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className={`${glassCard} max-w-2xl mx-auto p-12 text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Nenhum produto selecionado</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Escolha um item da sua lista de produtos para começar.
          </p>
          <Button
            onClick={() => setPickerOpen(true)}
            className="rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30"
          >
            Escolher produto
          </Button>
        </div>
      )}

      {/* Picker modal */}
      {pickerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPickerOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${glassCard} w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col`}
          >
            <div className="flex items-center justify-between p-6 border-b border-border/60">
              <h3 className="text-lg font-bold">Escolha um produto</h3>
              <button
                onClick={() => setPickerOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 border-b border-border/60">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar produto..."
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div className="overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                  Nenhum produto encontrado.
                </div>
              )}
              {filtered.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => {
                    updateState({ productId: p.id });
                    setPickerOpen(false);
                  }}
                  className={`${glassSelectable(state.productId === p.id)} p-3`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                    {p.catalog_products?.image_url && (
                      <img
                        src={p.catalog_products.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs font-semibold line-clamp-2">{p.catalog_products?.product_name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
