import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, UserPlus, X, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { useState } from "react";

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

interface ProductDetailModalProps {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDetailModal = ({ product, open, onOpenChange }: ProductDetailModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const payload = product.raw_payload as Record<string, unknown> | null;

  // Images
  const mainImages = (payload?.main_images as Array<{ urls?: string[]; url?: string }>) || [];
  const imageUrls = [...new Set(mainImages.flatMap(img => img.urls || (img.url ? [img.url] : [])))];
  if (imageUrls.length === 0 && product.image_url) {
    imageUrls.push(product.image_url);
  }

  // Description
  const description = (payload?.description as string) || null;

  // SKUs
  const skus = (payload?.skus as Array<{
    id?: string;
    seller_sku?: string;
    price?: { sale_price?: string; tax_exclusive_price?: string; currency?: string };
    inventory?: Array<{ quantity?: number }>;
    sales_attributes?: Array<{ name?: string; value_name?: string; image?: { urls?: string[] } }>;
  }>) || [];

  // Category
  const rawCategories = payload?.category_chains;
  let categoryNames: string[] = [];
  if (Array.isArray(rawCategories) && rawCategories.length > 0) {
    const first = rawCategories[0];
    if (Array.isArray(first)) {
      categoryNames = first.map((c: any) => c.local_name).filter(Boolean);
    } else if (typeof first === 'object' && first !== null && 'local_name' in first) {
      categoryNames = rawCategories.map((c: any) => c.local_name).filter(Boolean);
    }
  }

  // Sales regions
  const salesRegions = (payload?.sales_regions as string[]) || [];

  // Package dimensions
  const packageDimensions = payload?.package_dimensions as {
    height?: string; length?: string; width?: string; unit?: string;
  } | null;
  const packageWeight = payload?.package_weight as { value?: string; unit?: string } | null;

  // Brand
  const brand = (payload?.brand as { name?: string })?.name || null;

  // Unique attributes
  const attributeGroups = new Map<string, Set<string>>();
  skus.forEach(sku => {
    sku.sales_attributes?.forEach(attr => {
      if (attr.name && attr.value_name) {
        if (!attributeGroups.has(attr.name)) {
          attributeGroups.set(attr.name, new Set());
        }
        attributeGroups.get(attr.name)!.add(attr.value_name);
      }
    });
  });

  const getPrice = () => {
    if (!skus.length) return null;
    const prices = skus.map(s => {
      const p = s.price?.sale_price || s.price?.tax_exclusive_price;
      return p ? parseFloat(p) : null;
    }).filter((p): p is number => p !== null);
    if (prices.length === 0) return null;
    const currency = skus[0]?.price?.currency || "BRL";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `R$${min.toFixed(2)}`;
    return `R$${min.toFixed(2)} - R$${max.toFixed(2)}`;
  };

  const getTotalStock = () => {
    return skus.reduce((total, sku) => {
      const qty = sku.inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
      return total + qty;
    }, 0);
  };

  const currentImage = imageUrls[selectedImageIndex] || null;

  const prevImage = () => setSelectedImageIndex(i => (i > 0 ? i - 1 : imageUrls.length - 1));
  const nextImage = () => setSelectedImageIndex(i => (i < imageUrls.length - 1 ? i + 1 : 0));

  // Product detail attributes for "Detalhes do Produto" section
  const detailRows: { label: string; value: string }[] = [];
  if (categoryNames.length > 0) detailRows.push({ label: "Categoria", value: categoryNames.join(" › ") });
  if (brand) detailRows.push({ label: "Marca", value: brand });
  if (salesRegions.length > 0) detailRows.push({ label: "Regiões de Venda", value: salesRegions.join(", ") });
  if (packageWeight) detailRows.push({ label: "Peso", value: `${packageWeight.value} ${packageWeight.unit || 'kg'}` });
  if (packageDimensions) detailRows.push({ label: "Dimensões", value: `${packageDimensions.length}×${packageDimensions.width}×${packageDimensions.height} ${packageDimensions.unit || 'cm'}` });
  detailRows.push({ label: "Estoque", value: `${getTotalStock()} unidades` });
  detailRows.push({ label: "Plataforma", value: product.source_platform === "tiktok_shop" ? "TikTok Shop" : product.source_platform });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-full h-[100dvh] max-h-[100dvh] p-0 border-none rounded-none sm:rounded-none overflow-y-auto bg-background [&>button]:hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground truncate max-w-[80%]">{product.product_name}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-12">
          {/* Product Hero: Image + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden border border-border">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-all shadow-lg"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-all shadow-lg"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        i === selectedImageIndex
                          ? "border-primary shadow-md"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                  {product.product_name}
                </h1>
              </div>

              {/* Price */}
              {getPrice() && (
                <p className="text-3xl font-black text-primary">{getPrice()}</p>
              )}

              {/* Variants / Attributes */}
              {attributeGroups.size > 0 && (
                <div className="space-y-4">
                  {Array.from(attributeGroups.entries()).map(([name, values]) => (
                    <div key={name}>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                        {name}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {Array.from(values).map(v => (
                          <span
                            key={v}
                            className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-primary/50 transition-colors cursor-default"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SKU table if multiple */}
              {skus.length > 1 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                    Variantes ({skus.length})
                  </p>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-xs font-bold text-muted-foreground">SKU</th>
                          <th className="text-left p-3 text-xs font-bold text-muted-foreground">Atributos</th>
                          <th className="text-right p-3 text-xs font-bold text-muted-foreground">Preço</th>
                          <th className="text-right p-3 text-xs font-bold text-muted-foreground">Estoque</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skus.map((sku, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-3 text-muted-foreground font-mono text-xs">{sku.seller_sku || "—"}</td>
                            <td className="p-3">
                              {sku.sales_attributes?.map(a => a.value_name).filter(Boolean).join(", ") || "—"}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {sku.price?.sale_price || sku.price?.tax_exclusive_price
                                ? `R$${parseFloat(sku.price.sale_price || sku.price.tax_exclusive_price || "0").toFixed(2)}`
                                : "—"}
                            </td>
                            <td className="p-3 text-right">
                              {sku.inventory?.reduce((s, inv) => s + (inv.quantity || 0), 0) || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Afiliar-se */}
              <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg">
                <UserPlus size={16} />
                Afiliar-se
              </button>

              {/* Product ID */}
              <p className="text-xs text-muted-foreground">
                ID: {product.product_id} · Importado em {new Date(product.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Shop Section */}
          <div className="border border-border rounded-2xl p-6 bg-card mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Store size={24} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">
                  {product.source_platform === "tiktok_shop" ? "TikTok Shop" : product.source_platform}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  Shop Cipher: {product.raw_payload?.shop_cipher as string || "—"}
                </p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-lg font-black text-foreground">{skus.length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Variantes</p>
                </div>
                <div>
                  <p className="text-lg font-black text-foreground">{getTotalStock()}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Estoque</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes do Produto */}
          {detailRows.length > 0 && (
            <div className="border border-border rounded-2xl bg-card mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-black text-foreground uppercase tracking-tight">Detalhes do Produto</h3>
              </div>
              <div className="divide-y divide-border">
                {detailRows.map((row, i) => (
                  <div key={i} className="flex px-6 py-4">
                    <span className="w-40 shrink-0 text-sm text-muted-foreground font-medium">{row.label}</span>
                    <span className="text-sm text-foreground font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descrição do Produto */}
          {description && (
            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-black text-foreground uppercase tracking-tight">Descrição do Produto</h3>
              </div>
              <div className="px-6 py-6">
                <div
                  className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
