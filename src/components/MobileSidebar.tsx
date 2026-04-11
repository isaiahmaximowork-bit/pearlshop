import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AppSidebarContent } from "@/components/AppSidebar";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-accent transition-all md:hidden">
          <Menu size={20} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <AppSidebarContent />
      </SheetContent>
    </Sheet>
  );
}
