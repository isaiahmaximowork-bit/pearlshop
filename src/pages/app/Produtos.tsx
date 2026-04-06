import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package, RefreshCw, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";

interface CatalogProduct {
  id: string;
  product_id: string;
  product_name: string;
  image_url: string | null;
  source_platform: string;
  status: string;
  created_at: string;
  raw_payload: Record<string, unknown> | null;
}

const Produtos = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Fetch from catalog_products table
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["catalog-products", search],
    queryFn: async () => {
      let query = supabase
        .from("catalog_products")
        .select("*")
        .eq("source_platform", "tiktok_shop")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("product_name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data || []) as CatalogProduct[];
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

      if (!response.ok) {
        throw new Error(result.error || "Erro ao importar produtos");
      }

      toast.success(`${result.imported || 0} produtos importados com sucesso!`);
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const getPrice = (product: CatalogProduct) => {
    const payload = product.raw_payload as Record<string, unknown> | null;
    const skus = payload?.skus as Array<{ price?: { sale_price?: string; currency?: string } }> | undefined;
    if (!skus?.length) return "—";
    const price = skus[0]?.price?.sale_price;
    const currency = skus[0]?.price?.currency || "USD";
    if (!price) return "—";
    return `${currency} ${(parseInt(price) / 100).toFixed(2)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Produtos</h1>
          <p className="text-muted-foreground mt-1">Produtos importados do TikTok Shop.</p>
        </div>
        <Button onClick={handleImport} disabled={isImporting}>
          {isImporting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Importar do TikTok
            </>
          )}
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">Buscar</Button>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Erro ao carregar produtos</p>
            <p className="text-sm opacity-80">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Products grid */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2">{product.product_name}</h3>
                      <p className="text-primary font-semibold">{getPrice(product)}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          product.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {product.status === "active" ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Produtos;
