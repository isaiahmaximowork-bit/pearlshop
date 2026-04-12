import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package, RefreshCcw, AlertCircle, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";

interface CatalogProduct {
  id: string;
  product_id: string;
  product_name: string;
  image_url: string | null;
  source_platform: string;
  status: string;
  created_at: string;
  raw_payload: Record<string, unknown> | null;
  price: number | null;
  original_price: number | null;
  currency: string | null;
  is_on_sale: boolean | null;
  is_verified: boolean;
}

const Produtos = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["catalog-products", search],
    queryFn: async () => {
      let query = supabase
        .from("catalog_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("product_name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data || []) as CatalogProduct[];
    },
  });

  // Fetch user's affiliated product IDs
  const { data: affiliatedIds = [] } = useQuery({
    queryKey: ["user-products-ids", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_products")
        .select("catalog_product_id")
        .eq("user_id", user.id);
      return (data || []).map(r => r.catalog_product_id);
    },
    enabled: !!user,
  });

  const affiliateMutation = useMutation({
    mutationFn: async (product: CatalogProduct) => {
      if (!user) throw new Error("Faça login primeiro");
      const { error } = await supabase.from("user_products").insert({
        user_id: user.id,
        catalog_product_id: product.id,
        affiliate_url: `https://shop.tiktok.com/view/product/${product.product_id}`,
      });
      if (error) throw error;
    },
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: ["user-products-ids"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      // Open TikTok Shop affiliate page
      window.open(`https://shop.tiktok.com/view/product/${product.product_id}`, "_blank");
      toast.success("Produto adicionado aos seus produtos! Conclua a afiliação no TikTok Shop.");
    },
    onError: (err: any) => {
      if (err?.code === "23505") {
        toast.info("Você já está afiliado a este produto.");
      } else {
        toast.error(err.message || "Erro ao afiliar-se");
      }
    },
  });

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/fetch-tiktok-products`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao importar produtos");
      toast.success(`${result.imported || 0} produtos importados com sucesso!`);
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSearch = () => setSearch(searchInput);

  const getPrice = (product: CatalogProduct) => {
    if (product.price != null) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency || 'BRL' }).format(product.price);
    }
    const payload = product.raw_payload as Record<string, unknown> | null;
    const skus = payload?.skus as Array<{ price?: { sale_price?: string; tax_exclusive_price?: string; currency?: string } }> | undefined;
    const sku = skus?.[0]?.price;
    const price = sku?.sale_price || sku?.tax_exclusive_price;
    if (!price) return "—";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: sku?.currency || 'BRL' }).format(parseFloat(price));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
            Catálogo de Produtos
          </h1>
          <p className="text-muted-foreground font-medium tracking-tight">
            Produtos disponíveis para afiliação. Lojas verificadas são parceiras oficiais.
          </p>
        </div>
        <button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-foreground text-background rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          <ExternalLink size={18} />
          {isImporting ? "Importando..." : "Importar do TikTok"}
        </button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos pelo nome ou ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm shadow-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-4 bg-card border border-border rounded-2xl flex items-center gap-3 font-bold text-sm text-muted-foreground hover:bg-accent transition-all shadow-sm"
        >
          <Filter size={18} /> Filtrar
        </button>
        <button
          onClick={() => refetch()}
          className="p-4 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all shadow-sm"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Erro ao carregar produtos</p>
            <p className="text-sm opacity-80">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {!isLoading && !error && (
        <>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum produto no catálogo</p>
              <p className="text-sm">Clique em "Importar do TikTok" para buscar os produtos da sua loja.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{products.length} produtos no catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    title={product.product_name}
                    price={getPrice(product)}
                    status={product.status}
                    imageUrl={product.image_url}
                    isVerified={product.is_verified}
                    isAffiliated={affiliatedIds.includes(product.id)}
                    onClick={() => setSelectedProduct(product)}
                    onAffiliate={() => affiliateMutation.mutate(product)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}
      />
    </div>
  );
};

export default Produtos;
