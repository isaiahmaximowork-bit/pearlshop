import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Package, X, ExternalLink, Tag, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/components/builder/types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: any) => void;
}

const formatPrice = (value: number, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);

export const StudioProductModal = ({ item, open, onOpenChange, onSelect }: Props) => {
  const product = item?.catalog_products;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);

  useEffect(() => {
    if (item) setSelectedImageIndex(0);
  }, [item?.id]);

  if (!product) return null;

  let imageUrls: string[] = [];
  if (product.images && product.images.length > 0) imageUrls = product.images;
  else if (product.image_url) imageUrls = [product.image_url];

  const safeIndex =
    imageUrls.length > 0
      ? ((selectedImageIndex % imageUrls.length) + imageUrls.length) % imageUrls.length
      : 0;

  const priceInfo =
    product.price != null
      ? {
          salePrice: product.price,
          originalPrice: product.is_on_sale ? product.original_price : null,
        }
      : null;
  const currency = product.currency || "BRL";

  const originalProductUrl =
    product.affiliate_link || `https://www.tiktok.com/view/product/${product.product_id}`;

  const description = product.description || null;
  const payload = product.raw_payload as Record<string, unknown> | null;
  const descriptionText = description || (payload?.description as string) || null;

  const prevImage = () => {
    setSlideDirection(-1);
    setSelectedImageIndex((i) => (i > 0 ? i - 1 : imageUrls.length - 1));
  };
  const nextImage = () => {
    setSlideDirection(1);
    setSelectedImageIndex((i) => (i < imageUrls.length - 1 ? i + 1 : 0));
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const categoryLabel =
    PRODUCT_CATEGORIES.find((c) => c.value === item.category)?.label || item.category;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-full h-[100dvh] max-h-[100dvh] p-0 border-none rounded-none sm:rounded-none overflow-y-auto bg-background [&>button]:hidden">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground truncate max-w-[80%]">
            {product.product_name}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl bg-muted overflow-hidden border border-border">
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                  <motion.div
                    key={safeIndex}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    {imageUrls[safeIndex] ? (
                      <img
                        src={imageUrls[safeIndex]}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-all shadow-lg"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-all shadow-lg"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs font-bold text-foreground">
                  {safeIndex + 1} / {imageUrls.length || 1}
                </div>
              </div>

              {imageUrls.length > 1 && (
                <div className="hidden sm:flex gap-2 overflow-x-auto pb-1">
                  {imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSlideDirection(i > safeIndex ? 1 : -1);
                        setSelectedImageIndex(i);
                      }}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === safeIndex
                          ? "border-primary shadow-md ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground/50 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                {product.product_name}
              </h1>

              {priceInfo && (
                <div className="space-y-1">
                  {priceInfo.originalPrice != null && (
                    <p className="text-sm font-semibold text-muted-foreground line-through">
                      {formatPrice(priceInfo.originalPrice, currency)}
                    </p>
                  )}
                  <p className="text-3xl font-black text-primary">
                    {formatPrice(priceInfo.salePrice ?? 0, currency)}
                  </p>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={() => {
                  onSelect(item.id);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/30"
              >
                <Sparkles size={18} />
                Gerar vídeo com este produto
              </button>

              {/* Open original product link */}
              <a
                href={originalProductUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-3 px-4 rounded-2xl border border-border bg-card hover:bg-muted transition-colors text-sm font-medium text-foreground"
              >
                <ExternalLink size={16} className="text-muted-foreground" />
                <span>Abrir produto original</span>
              </a>

              {item.category && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag size={14} />
                  <span>Categoria: <span className="font-semibold text-foreground">{categoryLabel}</span></span>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                ID: {product.product_id} · Importado em{" "}
                {new Date(product.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {descriptionText && (
            <div className="border border-border rounded-2xl bg-card overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-black text-foreground uppercase tracking-tight">
                  Descrição do Produto
                </h3>
              </div>
              <div className="px-6 py-6">
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap max-w-none">
                  {descriptionText}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
