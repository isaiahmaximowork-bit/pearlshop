import { useState, useEffect } from "react";
import { Truck, MapPin } from "lucide-react";

interface ShippingInfoProps {
  packageWeight: { value?: string; unit?: string } | null;
  packageDimensions: { height?: string; length?: string; width?: string; unit?: string } | null;
  sellerRegion?: string | null;
}

// Estimated shipping by region (simplified Brazilian state-based)
const SHIPPING_RATES: Record<string, { price: number; days: string }> = {
  "SP": { price: 0, days: "2-4 dias" },
  "RJ": { price: 8.90, days: "3-5 dias" },
  "MG": { price: 9.90, days: "3-6 dias" },
  "PR": { price: 12.90, days: "4-7 dias" },
  "SC": { price: 14.90, days: "5-8 dias" },
  "RS": { price: 16.90, days: "5-9 dias" },
  "ES": { price: 10.90, days: "3-6 dias" },
  "BA": { price: 18.90, days: "6-10 dias" },
  "DF": { price: 15.90, days: "5-8 dias" },
  "GO": { price: 16.90, days: "5-8 dias" },
  "PE": { price: 22.90, days: "7-12 dias" },
  "CE": { price: 24.90, days: "8-13 dias" },
  "PA": { price: 28.90, days: "10-15 dias" },
  "AM": { price: 32.90, days: "12-18 dias" },
  "MT": { price: 19.90, days: "6-10 dias" },
  "MS": { price: 17.90, days: "5-9 dias" },
};

const DEFAULT_RATE = { price: 19.90, days: "7-12 dias" };

const STATE_NAMES: Record<string, string> = {
  "SP": "São Paulo", "RJ": "Rio de Janeiro", "MG": "Minas Gerais",
  "PR": "Paraná", "SC": "Santa Catarina", "RS": "Rio Grande do Sul",
  "ES": "Espírito Santo", "BA": "Bahia", "DF": "Distrito Federal",
  "GO": "Goiás", "PE": "Pernambuco", "CE": "Ceará",
  "PA": "Pará", "AM": "Amazonas", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul",
};

export function ShippingInfo({ packageWeight, packageDimensions, sellerRegion }: ShippingInfoProps) {
  const [userState, setUserState] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.region_code) {
          setUserState(data.region_code);
          setUserCity(data.city || null);
        } else if (data.region) {
          // Try to match region name
          const entry = Object.entries(STATE_NAMES).find(
            ([, name]) => data.region.toLowerCase().includes(name.toLowerCase())
          );
          if (entry) setUserState(entry[0]);
          setUserCity(data.city || null);
        }
      } catch {
        // Fallback to SP
        setUserState("SP");
      } finally {
        setLoading(false);
      }
    }
    detectLocation();
  }, []);

  const rate = userState ? (SHIPPING_RATES[userState] || DEFAULT_RATE) : DEFAULT_RATE;
  const isFree = rate.price === 0;
  const stateName = userState ? (STATE_NAMES[userState] || userState) : "Brasil";
  const locationLabel = userCity ? `${userCity}, ${stateName}` : stateName;

  if (loading) {
    return (
      <div className="border border-border rounded-xl p-4 bg-card animate-pulse">
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-center gap-3">
        <Truck size={18} className="text-muted-foreground shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Frete:</span>
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{locationLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pl-8">
        <div>
          <span className="text-sm text-muted-foreground">Frete</span>
        </div>
        <div className="flex items-center gap-2">
          {isFree ? (
            <>
              <span className="text-sm line-through text-muted-foreground">R$8,39</span>
              <span className="text-sm font-bold text-green-500">R$0,00</span>
            </>
          ) : (
            <span className="text-sm font-bold text-foreground">R${rate.price.toFixed(2).replace('.', ',')}</span>
          )}
        </div>
      </div>

      {isFree && (
        <p className="text-xs font-semibold text-green-500 pl-8">
          Frete grátis para {stateName}
        </p>
      )}

      <p className="text-xs text-muted-foreground pl-8">
        Entrega estimada: {rate.days}
      </p>

      {packageWeight && (
        <p className="text-[10px] text-muted-foreground pl-8">
          Peso: {packageWeight.value} {packageWeight.unit || 'kg'}
          {packageDimensions && ` · ${packageDimensions.length}×${packageDimensions.width}×${packageDimensions.height} ${packageDimensions.unit || 'cm'}`}
        </p>
      )}
    </div>
  );
}
