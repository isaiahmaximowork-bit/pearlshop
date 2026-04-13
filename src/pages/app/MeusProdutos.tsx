import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Trash2, ExternalLink, Search, Filter, Tag, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PRODUCT_CATEGORIES } from "@/components/builder/types";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { MyProductModal } from "@/components/MyProductModal";

const MeusProdutos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
      toast.success("Produto removido da sua lista e da loja.");
    },
    onError: () => toast.error("Erro ao remover produto."),
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const { error } = await supabase.from("user_products").update({ affiliate_url: url }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      toast.success("Link de vendas salvo com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar link."),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: string }) => {
      const { error } = await supabase.from("user_products").update({ category }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      toast.success("Categoria atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar categoria."),
  });

  const getPrice = (product: any) => {
    if (product.price != null) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency || 'BRL' }).format(product.price);
    }
    return "—";
  };

  // Filter products
  const filtered = useMemo(() => {
    return myProducts.filter((item: any) => {
      const product = item.catalog_products;
      if (!product) return false;
      const matchesSearch = !searchQuery || product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [myProducts, searchQuery, categoryFilter]);

  // Split into 3 groups
  const activeProducts = filtered.filter((item: any) => !!item.affiliate_url && item.catalog_products?.status !== 'inactive');
  const pendingProducts = filtered.filter((item: any) => !item.affiliate_url && item.catalog_products?.status !== 'inactive');
  const inactiveProducts = filtered.filter((item: any) => item.catalog_products?.status === 'inactive');

  const openProductModal = (item: any) => {
    setSelectedProduct(item);
    setModalOpen(true);
  };

  const renderProductCard = (item: any) => {
    const product = item.catalog_products;
    if (!product) return null;
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => openProductModal(item)}
        className="bg-card rounded-3xl border border-border p-4 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer"
      >
        <div className="aspect-square rounded-2xl bg-muted overflow-hidden mb-4 relative shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="space-y-2 flex-1 flex flex-col">
          <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
            {product.product_name}
          </h4>
          <span className="text-lg font-black text-foreground">{getPrice(product)}</span>
          {item.category && (
            <div className="flex items-center gap-1">
              <Tag size={10} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">
                {PRODUCT_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
              </span>
            </div>
          )}
          <div className="mt-auto flex gap-2 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); removeMutation.mutate(item.id); }}
              className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
              title="Remover produto"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSection = (title: string, products: any[], colorClass: string, dotColor: string) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
        <h2 className={`text-lg font-black tracking-tight uppercase ${colorClass}`}>{title}</h2>
        <span className="text-sm text-muted-foreground font-medium">({products.length})</span>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(renderProductCard)}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
          Nenhum produto nesta seção
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
          Meus Produtos
        </h1>
        <p className="text-muted-foreground font-medium tracking-tight">
          Gerencie seus produtos afiliados. Adicione links de vendas e organize por categoria.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-card border border-border rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {PRODUCT_CATEGORIES.filter(c => c.value !== "promocao").map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.value === "" ? "Todas as categorias" : cat.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
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
        <div className="space-y-10">
          {renderSection("Produtos Ativos", activeProducts, "text-green-400", "bg-green-500")}
          <div className="border-t border-border" />
          {renderSection("Verificação Pendente", pendingProducts, "text-yellow-400", "bg-yellow-500")}
          <div className="border-t border-border" />
          {renderSection("Produtos Inativos", inactiveProducts, "text-muted-foreground", "bg-muted-foreground")}
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <MyProductModal
          item={selectedProduct}
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setSelectedProduct(null);
          }}
          onSaveLink={(id, url) => updateLinkMutation.mutate({ id, url })}
          onUpdateCategory={(id, category) => updateCategoryMutation.mutate({ id, category })}
          onRemove={(id) => { removeMutation.mutate(id); setModalOpen(false); }}
          isSavingLink={updateLinkMutation.isPending}
        />
      )}
    </div>
  );
};

export default MeusProdutos;
