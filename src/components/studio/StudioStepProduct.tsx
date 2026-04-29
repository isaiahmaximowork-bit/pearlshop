import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Search, Sparkles, Tag, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_CATEGORIES } from "@/components/builder/types";
import { StudioProductModal } from "./StudioProductModal";
import type { StudioState } from "@/pages/app/Studio";

interface Props {
  state: StudioState;
  updateState: (patch: Partial<StudioState>) => void;
  onAdvance?: () => void;
}

export function StudioStepProduct({ state, updateState, onAdvance }: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["studio-user-products", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_products")
        .select("*, catalog_products(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const getPrice = (product: any) => {
    if (product?.price != null) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: product.currency || "BRL",
      }).format(product.price);
    }
    return "—";
  };

  const filtered = useMemo(() => {
    return products.filter((item: any) => {
      const product = item.catalog_products;
      if (!product) return false;
      return !search || product.product_name.toLowerCase().includes(search.toLowerCase());
    });
  }, [products, search]);

  const openModal = (item: any) => {
    setSelectedProduct(item);
    setModalOpen(true);
  };

  const handleSelect = (id: string) => {
    updateState({ productId: id });
    onAdvance?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto mb-2">
        <h2 className="text-3xl font-black tracking-tight mb-2">Sua vitrine de produtos</h2>
        <p className="text-muted-foreground">
          Escolha um produto que você já se afiliou para gerar seu vídeo com IA.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full bg-card/80 backdrop-blur-sm border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="max-w-lg mx-auto rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Nenhum produto afiliado</h3>
          <p className="text-sm text-muted-foreground">
            Vá ao Catálogo e se afilie a um produto para começar a criar vídeos aqui.
          </p>
        </div>
      )}

      {!isLoading && products.length > 0 && filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-8 text-sm">
          Nenhum produto encontrado.
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item: any) => {
            const product = item.catalog_products;
            if (!product) return null;
            const isSelected = state.productId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => openModal(item)}
                className={`bg-card rounded-3xl border p-4 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer relative ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20"
                    : "border-border"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                )}
                <div className="aspect-square rounded-2xl bg-muted overflow-hidden mb-3 relative shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col">
                  <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                    {product.product_name}
                  </h4>
                  <span className="text-base font-black text-foreground">{getPrice(product)}</span>
                  {item.category && (
                    <div className="flex items-center gap-1">
                      <Tag size={10} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {PRODUCT_CATEGORIES.find((c) => c.value === item.category)?.label ||
                          item.category}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(item.id);
                    }}
                    className={`mt-auto w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                      isSelected
                        ? "bg-muted text-muted-foreground"
                        : "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground hover:opacity-90 shadow-primary/30"
                    }`}
                  >
                    <Sparkles size={12} />
                    {isSelected ? "Selecionado ✓" : "Gerar vídeo"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedProduct && (
        <StudioProductModal
          item={selectedProduct}
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setSelectedProduct(null);
          }}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
