import { Home, Package, ShoppingBag, Settings, Link, LogOut, LayoutGrid } from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Menu Principal", items: [
    { title: "Home", url: "/app", icon: Home, end: true },
    { title: "Meus Produtos", url: "/app/meus-produtos", icon: Package },
    { title: "Produtos", url: "/app/produtos", icon: ShoppingBag },
  ]},
  { label: "Configurações", items: [
    { title: "Opções", url: "/app/opcoes", icon: Settings },
    { title: "Conexões", url: "/app/conexoes", icon: Link },
  ]},
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col p-6 sticky top-0 h-screen shrink-0">
      <div className="flex items-center gap-2 mb-12 px-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg">
          <ShoppingBag size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-black tracking-tighter text-foreground uppercase">PearlShop</span>
      </div>

      <nav className="flex-1 space-y-6">
        {menuItems.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-4">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.url, item.end);
                return (
                  <RouterNavLink
                    key={item.url}
                    to={item.url}
                    end={item.end}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <item.icon size={20} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
                    <span className={`text-sm tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
                      {item.title}
                    </span>
                  </RouterNavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-6">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut size={20} />
          <span className="text-sm font-bold">Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
