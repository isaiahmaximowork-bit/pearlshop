import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';
import logo from '@/assets/logo.png';
import pearlpostLogo from '@/assets/pearlpost-logo.png';

const FooterSection = () => {
  return (
    <footer className="relative z-10 bg-white text-black py-12 md:py-20 px-4 md:px-20 border-t border-zinc-100 font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Coluna 1: Branding */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="PearlShop.io" className="h-10 w-auto brightness-0" />
            </div>
            <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed">
              A plataforma líder em automação de vendas para o TikTok Shop. Criamos, publicamos e escalamos a sua operação 24/7 com inteligência artificial.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Coluna 2: Produto */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Produto</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">IA Avatares</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Loja Automática</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Curadoria</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Preços</a></li>
            </ul>
          </div>

          {/* Coluna 3: Empresa */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Empresa</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Comunidade</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Afiliados</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Coluna 4: Suporte */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Suporte</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="/termos-de-uso" className="text-zinc-600 hover:text-purple-600 transition-colors">Termos de Uso</a></li>
              <li><a href="/politica-de-privacidade" className="text-zinc-600 hover:text-purple-600 transition-colors">Privacidade</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Documentação</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-purple-600 transition-colors">Central de Ajuda</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-black tracking-tight">Receba tendências do TikTok</p>
            <p className="text-xs text-zinc-500 font-medium">Os produtos que mais vendem, direto no seu e-mail.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="seu@email.com"
              className="bg-zinc-100 border-none px-6 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20 transition-all w-full md:w-64"
            />
            <button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
              Assinar
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-20 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">© 2026 PearlShop.io • Made with AI</p>
        </div>

        {/* By PearlPost */}
        <a href="https://pearlpost.io" target="_blank" rel="noopener noreferrer" className="mt-14 flex items-center justify-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">Powered By</span>
          <img src={pearlpostLogo} alt="PearlPost.io" className="h-8 w-auto" />
        </a>
      </div>
    </footer>
  );
};

export default FooterSection;
