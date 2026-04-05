import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package, RefreshCw, AlertCircle } from "lucide-react";

interface TikTokProduct {
  id: string;
  title: string;
  status: number;
  skus?: Array<{
    id: string;
    price?: { sale_price?: string; currency?: string };
  }>;
  main_images?: Array<{ url: string }>;
  create_time?: number;
}

const fetchProducts = async (page: number, search: string) => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/tiktok-shop-products?page_number=${page}&page_size=20&search=${encodeURIComponent(search)}`;

  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Erro ao buscar produtos');
  }

  return response.json();
};

const Produtos = () => {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tiktok-products", page, search],
    queryFn: () => fetchProducts(page, search),
  });

  const products: TikTokProduct[] = data?.data?.products || [];
  const totalCount = data?.data?.total_count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const formatPrice = (skus?: TikTokProduct["skus"]) => {
    if (!skus?.length) return "—";
    const price = skus[0]?.price?.sale_price;
    const currency = skus[0]?.price?.currency || "USD";
    if (!price) return "—";
    return `${currency} ${(parseInt(price) / 100).toFixed(2)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Catálogo de Produtos</h1>
        <p className="text-muted-foreground mt-1">Produtos disponíveis no TikTok Shop para se afiliar.</p>
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
        <Button onClick={handleSearch} variant="secondary">
          Buscar
        </Button>
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
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm">Tente buscar com outros termos ou verifique a conexão com o TikTok Shop.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{totalCount} produtos encontrados</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {product.main_images?.[0]?.url ? (
                      <img
                        src={product.main_images[0].url}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2">{product.title}</h3>
                      <p className="text-primary font-semibold">{formatPrice(product.skus)}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          product.status === 4 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {product.status === 4 ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próximo
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Produtos;
