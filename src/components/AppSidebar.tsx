import { Home, Package, ShoppingBag, Settings, Link, LayoutTemplate, Sparkles, Video, Zap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import logo from "@/assets/logo.png";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";

const mainItems = [
  { title: "Home", url: "/app", icon: Home, end: true },
  { title: "Meus Produtos", url: "/app/meus-produtos", icon: Package },
  { title: "Catálogo", url: "/app/produtos", icon: ShoppingBag },
];

const studioItems = [
  { title: "Studio", url: "/app/studio", icon: Sparkles },
  { title: "UGC Avatar Gen", url: "/app/ugc-builder", icon: Video },
  { title: "Turbinar", url: "/app/turbinar", icon: Zap },
];

const configItems = [
  { title: "Opções", url: "/app/opcoes", icon: Settings },
  { title: "Conexões", url: "/app/conexoes", icon: Link },
];

interface ItemDef { title: string; url: string; icon: any; end?: boolean }

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();
  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const renderItem = (item: ItemDef) => {
    const active = isActive(item.url, item.end);
    return (
      <RouterNavLink
        key={item.url}
        to={item.url}
        end={item.end}
        title={collapsed ? item.title : undefined}
        className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all duration-300 group ${
          active
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <item.icon size={20} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
        {!collapsed && (
          <span className={`text-sm tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
            {item.title}
          </span>
        )}
      </RouterNavLink>
    );
  };

  const renderGroup = (label: string, items: ItemDef[]) => (
    <div>
      {!collapsed && (
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-4">
          {label}
        </p>
      )}
      <div className="space-y-1">{items.map(renderItem)}</div>
    </div>
  );

  return (
    <nav className="flex-1 flex flex-col gap-8">
      {renderGroup("Menu Principal", mainItems)}
      {renderGroup("PearlShop Studio", studioItems)}
      {renderGroup("Loja Virtual", [{ title: "Minha Loja", url: "/app/minha-loja", icon: LayoutTemplate }])}
      <div className="mt-auto">{renderGroup("Configurações", configItems)}</div>
    </nav>
  );
}

export function AppSidebarContent({ showCollapseButton = false }: { showCollapseButton?: boolean }) {
  const { collapsed, toggle } = useSidebar();
  const isCollapsed = showCollapseButton && collapsed;

  return (
    <div className={`flex flex-col ${isCollapsed ? 'p-3' : 'p-6'} h-full transition-all duration-300`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-12 ${isCollapsed ? '' : 'px-2'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="PearlShop" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-black tracking-tighter text-foreground pr-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              PearlShop<span className="italic bg-gradient-to-b from-primary to-[hsl(262,83%,38%)] bg-clip-text text-transparent">.io</span>
            </span>
          </div>
        )}
        {showCollapseButton && (
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      <SidebarNav collapsed={isCollapsed} />
    </div>
  );
}

export function AppSidebar() {
  const { collapsed } = useSidebar();
  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-72'} bg-card border-r border-border hidden md:flex flex-col sticky top-0 h-screen shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      <AppSidebarContent showCollapseButton />
    </aside>
  );
}
