import { Home, Package, ShoppingBag, Settings, Link, LayoutTemplate } from "lucide-react";
import logo from "@/assets/logo.png";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";

const mainItems = [
  { title: "Home", url: "/", icon: Home, end: true },
  { title: "Meus Produtos", url: "/meus-produtos", icon: Package },
  { title: "Catálogo", url: "/produtos", icon: ShoppingBag },
];

const configItems = [
  { title: "Opções", url: "/opcoes", icon: Settings },
  { title: "Conexões", url: "/conexoes", icon: Link },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const renderItem = (item: { title: string; url: string; icon: any; end?: boolean }) => {
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
  };

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col p-6 sticky top-0 h-screen shrink-0">
      <div className="flex items-center gap-2.5 mb-12 px-2">
        <img src={logo} alt="PearlShop" width={32} height={32} className="rounded-lg" />
        <span className="text-xl font-black tracking-tighter text-foreground pr-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
          PearlShop<span className="italic bg-gradient-to-b from-primary to-[hsl(262,83%,38%)] bg-clip-text text-transparent">.io</span>
        </span>
      </div>

      <nav className="flex-1 flex flex-col">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-4">
            Menu Principal
          </p>
          <div className="space-y-1">
            {mainItems.map(renderItem)}
          </div>
        </div>

        <div className="mt-14">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-4">
            Loja Virtual
          </p>
          <div className="space-y-1">
            {[{ title: "Builder", url: "/builder", icon: LayoutTemplate }].map(renderItem)}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-4">
            Configurações
          </p>
          <div className="space-y-1">
            {configItems.map(renderItem)}
          </div>
        </div>
      </nav>
    </aside>
  );
}
