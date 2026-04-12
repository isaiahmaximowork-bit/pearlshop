import { MoreHorizontal, UserPlus, Package, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  title: string;
  price: string;
  status: string;
  imageUrl: string | null;
  isVerified?: boolean;
  isAffiliated?: boolean;
  onClick?: () => void;
  onAffiliate?: () => void;
}

export function ProductCard({ title, price, status, imageUrl, isVerified, isAffiliated, onClick, onAffiliate }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-card rounded-3xl border border-border p-4 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer"
    >
      <div className="aspect-square rounded-2xl bg-muted overflow-hidden mb-4 relative shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="space-y-2 flex-1 flex flex-col">
        <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
          {title}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-foreground">{price}</span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-accent transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {isVerified && (
          <div className="flex items-center gap-1.5">
            <BadgeCheck size={16} className="shrink-0 fill-[#3897f0] text-white" />
            <span className="text-[11px] font-semibold text-[#3897f0]">Loja verificada</span>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onAffiliate?.(); }}
          disabled={isAffiliated}
          className={`mt-auto w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
            isAffiliated
              ? "bg-muted text-muted-foreground cursor-default"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          <UserPlus size={14} />
          {isAffiliated ? "Afiliado ✓" : "Afiliar-se"}
        </button>
      </div>
    </motion.div>
  );
}