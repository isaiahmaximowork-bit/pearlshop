import { ShoppingBag, Cpu, Share2, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CinematicCard from './CinematicCard';

const OperationalFlowSection = () => (
  <section className="relative z-10 max-w-7xl mx-auto w-full py-24 px-6">
    <div className="text-center mb-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
      >
        <Zap size={12} className="text-purple-500" />
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Operational Flow</span>
      </motion.div>
      
      <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 font-poppins leading-tight">
        Veja isso <span className="italic text-gradient-purple uppercase">Acontecendo.</span>
      </h2>
      <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-poppins">
        O fluxo automatizado que transforma produtos em lucro, <br className="hidden md:block" /> sem que você precise gravar um único segundo.
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
      <CinematicCard 
        step="01"
        title="Curadoria Inteligente"
        subtitle="Análise de Tendências"
        image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"
        icon={ShoppingBag}
        tags={["Trendy", "Viral Score", "9.8"]}
        description="Nossa IA varre o TikTok Shop e identifica produtos com alto volume de busca e baixa concorrência de vídeos de qualidade."
        stats={{ label: "Precisão", value: "98.4%" }}
      />
      <CinematicCard 
        step="02"
        title="Produção Autônoma"
        subtitle="Digital Actors"
        image="https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oQzRsFyaAAAeAjIjAEFuePoD7fU3SLTEDIED5I~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=Bqw%2Fi5VYGiJvuRLVMzcJtB%2BMSZg%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b"
        icon={Cpu}
        tags={["Realismo", "4K Render"]}
        description="Geramos vídeos com apresentadores digitais idênticos a humanos. Roteiros otimizados para retenção e compra."
        stats={{ label: "Velocidade", value: "< 2 min" }}
      />
      <CinematicCard 
        step="03"
        title="Distribuição em Massa"
        subtitle="Multi-Platform"
        image="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600"
        icon={Share2}
        tags={["TikTok", "Reels", "Shorts"]}
        description="Publicação simultânea em todas as redes com comentário automático do seu link para máxima conversão."
        stats={{ label: "Escala", value: "Global" }}
      />
      <CinematicCard 
        step="04"
        title="Receita Passiva"
        subtitle="Resultados Reais"
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
        icon={TrendingUp}
        tags={["ROI", "Sales", "Cashout"]}
        description="Acompanhe as comissões caindo em tempo real. O software repete o processo enquanto você foca na estratégia."
        stats={{ label: "Status", value: "Confirmado" }}
      />
    </div>

    <div className="mt-20 text-center">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group px-10 py-5 rounded-2xl bg-white text-black font-extrabold text-sm uppercase tracking-widest transition-all flex items-center gap-3 mx-auto shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
      >
        Quero esse fluxo agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  </section>
);

export default OperationalFlowSection;
