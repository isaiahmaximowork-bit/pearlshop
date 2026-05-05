import { Zap, Construction } from "lucide-react";

const Turbinar = () => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
    <div className="text-center space-y-4 max-w-md">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
        <Zap size={28} className="text-white" />
      </div>
      <h1 className="text-3xl font-black tracking-tight">Turbinar</h1>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
        <Construction size={16} className="text-primary" />
        <span className="text-sm font-bold text-primary">Em breve</span>
      </div>
      <p className="text-muted-foreground text-sm">
        Estamos trabalhando nessa funcionalidade. Em breve você poderá turbinar suas criações com IA.
      </p>
    </div>
  </div>
);

export default Turbinar;
