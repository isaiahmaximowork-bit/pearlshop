import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Trash2, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MeusProdutos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myProducts = [], isLoading } = useQuery({
    queryKey: ["user-products", user?.id],
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

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      queryClient.invalidateQueries({ queryKey: ["user-products-ids"] });
      toast.success("Produto removido da sua lista.");
    },
    onError: () => toast.error("Erro ao remover produto."),
  });

  const getPrice = (product: any) => {
    if (product.price != null) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency || 'BRL' }).format(product.price);
    }
    return "—";
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
          Meus Produtos
        </h1>
        <p className="text-muted-foreground font-medium tracking-tight">
          Produtos que você se afiliou. Conclua a afiliação no TikTok Shop para começar a vender.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && myProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum produto afiliado</p>
          <p className="text-sm">Vá ao Catálogo e clique em "Afiliar-se" para adicionar produtos aqui.</p>
        </div>
      )}

      {!isLoading && myProducts.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">{myProducts.length} produtos afiliados</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myProducts.map((item: any) => {
              const product = item.catalog_products;
              if (!product) return null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl border border-border p-4 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                >
                  <div className="aspect-square rounded-2xl bg-muted overflow-hidden mb-4 relative shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                      product.is_verified
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                    }`}>
                      {product.is_verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {product.is_verified ? "Verificado" : "Não verificado"}
                    </div>
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col">
                    <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                      {product.product_name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-foreground">{getPrice(product)}</span>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <a
                        href={item.affiliate_url || `https://shop.tiktok.com/view/product/${product.product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg"
                      >
                        <ExternalLink size={14} />
                        Abrir no TikTok
                      </a>
                      <button
                        onClick={() => removeMutation.mutate(item.id)}
                        className="p-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MeusProdutos;
