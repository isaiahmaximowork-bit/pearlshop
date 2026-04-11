import { useEffect, useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Opcoes = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Opções</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie as configurações da sua conta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme-toggle" className="text-sm font-semibold text-foreground">
                Tema Escuro
              </Label>
              <p className="text-xs text-muted-foreground">
                Alterne entre o tema claro e escuro
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={isDark}
              onCheckedChange={setIsDark}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <LogOut size={20} />
            Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Sair da conta</p>
              <p className="text-xs text-muted-foreground">
                Encerre sua sessão atual
              </p>
            </div>
            <Button variant="destructive" size="sm" className="gap-2">
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Opcoes;
