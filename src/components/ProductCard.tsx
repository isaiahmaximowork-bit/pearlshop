import { MoreHorizontal, UserPlus, Package } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  title: string;
  price: string;
  status: string;
  imageUrl: string | null;
  onClick?: () => void;
}

export function ProductCard({ title, price, status, imageUrl, onClick }: ProductCardProps) {
  const isActive = status === "active" || status === "ACTIVATE";

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
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isActive
              ? 'bg-green-100 text-green-600'
              : 'bg-muted text-muted-foreground'
          }`}>
            {isActive ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>
      <div className="space-y-3 flex-1 flex flex-col">
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

        <button
          onClick={(e) => e.stopPropagation()}
          className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg"
        >
          <UserPlus size={14} />
          Afiliar-se
        </button>
      </div>
    </motion.div>
  );
}
