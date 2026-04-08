import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, UserPlus } from "lucide-react";

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
  if (!product) return null;

  const payload = product.raw_payload as Record<string, unknown> | null;

  // Images
  const mainImages = (payload?.main_images as Array<{ urls?: string[]; url?: string }>) || [];
  const imageUrls = [...new Set(mainImages.flatMap(img => img.urls || (img.url ? [img.url] : [])))];

  // Description
  const description = (payload?.description as string) || null;

  // SKUs (sizes, colors, prices)
  const skus = (payload?.skus as Array<{
    id?: string;
    seller_sku?: string;
    price?: { sale_price?: string; tax_exclusive_price?: string; currency?: string };
    inventory?: Array<{ quantity?: number }>;
    sales_attributes?: Array<{ name?: string; value_name?: string }>;
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

  // Status
  const tiktokStatus = payload?.status as string || product.status;

  // Get unique attribute names across all SKUs
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
    const sku = skus[0]?.price;
    const price = sku?.sale_price || sku?.tax_exclusive_price;
    const currency = sku?.currency || "BRL";
    if (!price) return null;
    return `${currency} ${parseFloat(price).toFixed(2)}`;
  };

  const getTotalStock = () => {
    return skus.reduce((total, sku) => {
      const qty = sku.inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
      return total + qty;
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{product.product_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images */}
          {imageUrls.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${product.product_name} ${i + 1}`}
                  className="h-48 w-48 object-cover rounded-lg border shrink-0"
                />
              ))}
            </div>
          ) : product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="h-48 w-48 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-48 w-48 bg-muted flex items-center justify-center rounded-lg">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}

          {/* Price & Status */}
          <div className="flex items-center gap-3 flex-wrap">
            {getPrice() && (
              <span className="text-xl font-bold text-primary">{getPrice()}</span>
            )}
            <Badge variant={tiktokStatus === "ACTIVATE" || product.status === "active" ? "default" : "secondary"}>
              {tiktokStatus === "ACTIVATE" || product.status === "active" ? "Ativo" : tiktokStatus || "Inativo"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Estoque: {getTotalStock()}
            </span>
          </div>

          {/* Categories */}
          {categoryNames.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Categoria</h4>
              <p className="text-sm">{categoryNames.join(" › ")}</p>
            </div>
          )}

          {/* Sales Regions */}
          {salesRegions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Regiões de Venda</h4>
              <div className="flex gap-1">
                {salesRegions.map(r => (
                  <Badge key={r} variant="outline">{r}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attributes (sizes, colors, etc) */}
          {attributeGroups.size > 0 && (
            <div className="space-y-3">
              {Array.from(attributeGroups.entries()).map(([name, values]) => (
                <div key={name}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">{name}</h4>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from(values).map(v => (
                      <Badge key={v} variant="outline">{v}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SKU details table */}
          {skus.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Variantes ({skus.length})</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Atributos</th>
                      <th className="text-right p-2">Preço</th>
                      <th className="text-right p-2">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skus.map((sku, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 text-muted-foreground">{sku.seller_sku || "—"}</td>
                        <td className="p-2">
                          {sku.sales_attributes?.map(a => a.value_name).filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="p-2 text-right">
                          {sku.price?.sale_price || sku.price?.tax_exclusive_price
                            ? `${sku.price.currency || "BRL"} ${parseFloat(sku.price.sale_price || sku.price.tax_exclusive_price || "0").toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="p-2 text-right">
                          {sku.inventory?.reduce((s, inv) => s + (inv.quantity || 0), 0) || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Package info */}
          {(packageDimensions || packageWeight) && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Embalagem</h4>
              <p className="text-sm text-muted-foreground">
                {packageDimensions && `${packageDimensions.length}×${packageDimensions.width}×${packageDimensions.height} ${packageDimensions.unit || 'cm'}`}
                {packageDimensions && packageWeight && " · "}
                {packageWeight && `${packageWeight.value} ${packageWeight.unit || 'kg'}`}
              </p>
            </div>
          )}

          {/* Description */}
          {description && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Descrição</h4>
              <div className="text-sm text-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          )}

          {/* Afiliar-se */}
          <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg">
            <UserPlus size={14} />
            Afiliar-se
          </button>

          {/* Product ID */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            ID: {product.product_id} · Importado em {new Date(product.created_at).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
