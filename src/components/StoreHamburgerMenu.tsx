import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/components/builder/types";

interface MenuConfig {
  menuBgColor: string;
  menuTextColor: string;
  menuHighlightColor?: string;
  menuDetailColor?: string;
}

interface StoreHamburgerMenuProps {
  config: MenuConfig;
  logoMode: "text" | "image";
  logoText: string;
  logoImageUrl: string;
  logoColor: string;
  titleColor: string;
  subtitleColor: string;
  categories: string[];
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
}

const StoreHamburgerMenu = ({
  config,
  logoMode,
  logoText,
  logoImageUrl,
  logoColor,
  categories,
  onSelectCategory,
  activeCategory,
}: StoreHamburgerMenuProps) => {
  const [open, setOpen] = useState(false);

  const highlightColor = config.menuHighlightColor || config.menuTextColor;
  const detailColor = config.menuDetailColor || `${config.menuTextColor}20`;
  const textColor = config.menuTextColor;

  const categoryItems = PRODUCT_CATEGORIES.filter(
    (c) => c.value === "" || c.value === "promocao" || categories.includes(c.value)
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center transition-colors hover:bg-muted/50"
        style={{ color: textColor }}
      >
        <Menu size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div
            className="relative w-72 max-w-[80vw] h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
            style={{ backgroundColor: config.menuBgColor }}
          >
            {/* Logo */}
            <div className="p-5 flex items-center justify-between">
              {logoMode === "image" && logoImageUrl ? (
                <img src={logoImageUrl} alt="Logo" className="h-8 max-w-[140px] object-contain" />
              ) : (
                <span className="text-base font-bold" style={{ color: logoColor }}>
                  {logoText || "Loja"}
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Separator */}
            <div className="mx-5" style={{ borderTop: `1px solid ${detailColor}` }} />

            {/* Categories */}
            <div className="flex-1 overflow-y-auto py-4 px-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: highlightColor }}>
                Categorias
              </p>
              <div className="space-y-1">
                {categoryItems.map((cat) => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        onSelectCategory(cat.value);
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        color: isActive ? highlightColor : textColor,
                        backgroundColor: isActive ? `${textColor}10` : "transparent",
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer separator */}
            <div className="mx-5" style={{ borderTop: `1px solid ${detailColor}` }} />
            <div className="p-4">
              <a href="/aviso-legal" className="text-[10px] font-medium hover:underline" style={{ color: `${textColor}80` }}>
                Aviso Legal
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreHamburgerMenu;
