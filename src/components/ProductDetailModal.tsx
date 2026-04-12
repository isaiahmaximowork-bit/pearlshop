import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Package, UserPlus, X, ChevronLeft, ChevronRight, Store, ShoppingBag, Ruler } from "lucide-react";
import { ShippingInfo } from "@/components/ShippingInfo";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

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
  description?: string | null;
  images?: string[] | null;
  size_chart_url?: string | null;
  variants?: string | null;
  affiliate_link?: string | null;
  promo_info?: string | null;
}

interface ProductDetailModalProps {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "affiliate" | "buy";
  onAffiliate?: () => void;
  isAffiliated?: boolean;
}

const formatPrice = (value: number, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);

export const ProductDetailModal = ({ product, open, onOpenChange, mode = "affiliate", onAffiliate, isAffiliated }: ProductDetailModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => { setSelectedImageIndex(0); }, [product?.id]);

  // Fetch shop info
  const { data: shopInfo } = useQuery({
    queryKey: ["tiktok-shop-info"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tiktok_shop_tokens")
        .select("seller_name, shop_cipher, seller_base_region, open_id")
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: open,
  });

  if (!product) return null;

  const payload = product.raw_payload as Record<string, unknown> | null;

  // Images — prefer new `images` column, fallback to raw_payload, then image_url
  let imageUrls: string[] = [];
  if (product.images && product.images.length > 0) {
    imageUrls = product.images;
  } else {
    const mainImages = (payload?.main_images as Array<{ urls?: string[]; url?: string }>) || [];
    const seenBaseUrls = new Set<string>();
    for (const img of mainImages) {
      const url = img.urls?.[0] || img.url;
      if (!url) continue;
      const base = url.split("~")[0];
      if (!seenBaseUrls.has(base)) {
        seenBaseUrls.add(base);
        imageUrls.push(url);
      }
    }
  }
  if (imageUrls.length === 0 && product.image_url) {
    imageUrls.push(product.image_url);
  }

  // Description — prefer new column, fallback to raw_payload
  const description = product.description || (payload?.description as string) || null;

  // Size chart
  const sizeChartUrl = product.size_chart_url || null;

  // Variants text
  const variantsText = product.variants || null;

  // SKUs from raw_payload
  const skus = (payload?.skus as Array<{
    id?: string;
    seller_sku?: string;
    price?: { sale_price?: string; tax_exclusive_price?: string; currency?: string };
    inventory?: Array<{ quantity?: number }>;
    sales_attributes?: Array<{ name?: string; value_name?: string }>;
  }>) || [];

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

  const packageDimensions = payload?.package_dimensions as { height?: string; length?: string; width?: string; unit?: string } | null;
  const packageWeight = payload?.package_weight as { value?: string; unit?: string } | null;
  const brand = (payload?.brand as { name?: string })?.name || null;

  const hasMultipleVariants = skus.length > 1;
  const attributeGroups = new Map<string, Set<string>>();
  if (hasMultipleVariants) {
    skus.forEach(sku => {
      sku.sales_attributes?.forEach(attr => {
        if (attr.name && attr.value_name) {
          if (!attributeGroups.has(attr.name)) attributeGroups.set(attr.name, new Set());
          attributeGroups.get(attr.name)!.add(attr.value_name);
        }
      });
    });
  }

  const priceInfo = (() => {
    if (product.price != null) {
      return { salePrice: product.price, originalPrice: product.is_on_sale ? product.original_price : null, hasDiscount: !!product.is_on_sale };
    }
    const skuPrice = skus[0]?.price as Record<string, unknown> | undefined;
    const sale = Number(skuPrice?.sale_price ?? skuPrice?.tax_exclusive_price) || null;
    if (!sale) return null;
    return { salePrice: sale, originalPrice: null, hasDiscount: false };
  })();
  const productCurrency = product.currency || 'BRL';

  const getTotalStock = () => skus.reduce((total, sku) => {
    return total + (sku.inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0);
  }, 0);

  const goToImage = (index: number) => {
    setSlideDirection(index > selectedImageIndex ? 1 : -1);
    setSelectedImageIndex(index);
  };
  const prevImage = () => { setSlideDirection(-1); setSelectedImageIndex(i => (i > 0 ? i - 1 : imageUrls.length - 1)); };
  const nextImage = useCallback(() => { setSlideDirection(1); setSelectedImageIndex(i => (i < imageUrls.length - 1 ? i + 1 : 0)); }, [imageUrls.length]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!open || imageUrls.length <= 1) return;
    autoPlayRef.current = setInterval(nextImage, 5000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [open, imageUrls.length, nextImage]);

  // Reset autoplay on manual interaction
  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(nextImage, 5000);
  };

  const handlePrev = () => { prevImage(); resetAutoPlay(); };
  const handleNext = () => { nextImage(); resetAutoPlay(); };
  const handleThumbClick = (i: number) => { goToImage(i); resetAutoPlay(); };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext(); else handlePrev();
    }
    touchStartRef.current = null;
  };

  const detailRows: { label: string; value: string }[] = [];
  if (categoryNames.length > 0) detailRows.push({ label: "Categoria", value: categoryNames.join(" › ") });
  if (brand) detailRows.push({ label: "Marca", value: brand });
  if (variantsText) detailRows.push({ label: "Variações", value: variantsText });
  if (product.promo_info) detailRows.push({ label: "Promoção", value: product.promo_info });
  detailRows.push({ label: "Plataforma", value: "TikTok Shop" });

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-full h-[100dvh] max-h-[100dvh] p-0 border-none rounded-none sm:rounded-none overflow-y-auto bg-background [&>button]:hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground truncate max-w-[80%]">{product.product_name}</h2>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
            {/* Left: Image Gallery */}
            <div className="space-y-3">
              <div
                className="relative aspect-square rounded-2xl bg-muted overflow-hidden border border-border"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                  <motion.div
                    key={selectedImageIndex}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    {imageUrls[selectedImageIndex] ? (
                      <img src={imageUrls[selectedImageIndex]} alt={product.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {imageUrls.length > 1 && (
                  <>
                    <button onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-all shadow-lg hidden sm:flex">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-all shadow-lg hidden sm:flex">
                      <ChevronRight size={20} />
                    </button>
                    {/* Mobile dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:hidden">
                      {imageUrls.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === selectedImageIndex ? "bg-primary scale-125" : "bg-background/60"}`} />
                      ))}
                    </div>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs font-bold text-foreground">
                  {selectedImageIndex + 1} / {imageUrls.length}
                </div>
              </div>

              {/* Desktop thumbnails */}
              {imageUrls.length > 1 && (
                <div className="hidden sm:flex gap-2 overflow-x-auto pb-1">
                  {imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => handleThumbClick(i)}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === selectedImageIndex ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50 opacity-70 hover:opacity-100"
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
              <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                {product.product_name}
              </h1>

              {priceInfo && (
                <div className="space-y-1">
                  {priceInfo.originalPrice !== null && (
                    <p className="text-sm font-semibold text-muted-foreground line-through">
                      {formatPrice(priceInfo.originalPrice, productCurrency)}
                    </p>
                  )}
                  <p className="text-3xl font-black text-primary">
                    {formatPrice(priceInfo.salePrice ?? priceInfo.originalPrice ?? 0, productCurrency)}
                  </p>
                </div>
              )}

              {product.promo_info && (
                <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                  🔥 {product.promo_info}
                </div>
              )}

              {/* Action Button */}
              {mode === "buy" ? (
                <button
                  onClick={() => {
                    const url = product.affiliate_link || (payload?.product_url as string) || `https://www.tiktok.com/view/product/${product.product_id}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  <ShoppingBag size={16} />
                  Comprar
                </button>
              ) : (
                <button
                  onClick={() => onAffiliate?.()}
                  disabled={isAffiliated}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                    isAffiliated ? "bg-muted text-muted-foreground cursor-default" : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  <UserPlus size={16} />
                  {isAffiliated ? "Afiliado ✓" : "Afiliar-se"}
                </button>
              )}

              <ShippingInfo packageWeight={packageWeight} packageDimensions={packageDimensions} sellerRegion={shopInfo?.seller_base_region} />

              {/* Variants from new column */}
              {variantsText && !hasMultipleVariants && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Variações</p>
                  <p className="text-sm text-foreground">{variantsText}</p>
                </div>
              )}

              {/* Variants from SKUs */}
              {hasMultipleVariants && attributeGroups.size > 0 && (
                <div className="space-y-4 pt-2">
                  {Array.from(attributeGroups.entries()).map(([name, values]) => (
                    <div key={name}>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{name}</p>
                      <div className="flex gap-2 flex-wrap">
                        {Array.from(values).map(v => (
                          <span key={v} className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground">{v}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Size chart button */}
              {sizeChartUrl && (
                <button
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card text-sm font-bold text-foreground hover:bg-accent transition-colors w-full justify-center"
                >
                  <Ruler size={16} />
                  {showSizeChart ? "Ocultar Tabela de Medidas" : "Ver Tabela de Medidas"}
                </button>
              )}

              {showSizeChart && sizeChartUrl && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl overflow-hidden border border-border">
                  <img src={sizeChartUrl} alt="Tabela de medidas" className="w-full" loading="lazy" />
                </motion.div>
              )}

              <p className="text-xs text-muted-foreground">
                ID: {product.product_id} · Importado em {new Date(product.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Descrição do Produto */}
          {description && (
            <div className="border border-border rounded-2xl bg-card overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-black text-foreground uppercase tracking-tight">Descrição do Produto</h3>
              </div>
              <div className="px-6 py-6">
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap max-w-none">
                  {description}
                </div>
              </div>
            </div>
          )}

          {/* Detalhes */}
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

          {/* Shop Section */}
          <div className="border border-border rounded-2xl p-6 bg-card mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Store size={24} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{shopInfo?.seller_name || "TikTok Shop"}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {shopInfo?.open_id || "—"} · Região: {shopInfo?.seller_base_region || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
