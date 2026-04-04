import { ShoppingBag, Cpu, Share2, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CinematicCard from './CinematicCard';

const thumbnails = [
  "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oQzRsFyaAAAeAjIjAEFuePoD7fU3SLTEDIED5I~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=Bqw%2Fi5VYGiJvuRLVMzcJtB%2BMSZg%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oUA4wwBCpI0ria5OhufAIqOB23o7BACRAiAdvI~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=d0U2LCJozGiaxWynhcXWkK9hP98%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oAsEQDkYABwlcOGslgiAwCIiIA1mABEfCAB0Am~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=LTYfsU9M7jVV4kRFMB0yYWPnkxE%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oYwN0lAQIPGAmQeLepJGFm6rdABGWJAAIyseen~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=Nt2l%2FizFgou%2BRfqkGHRFJEtPDZA%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/o0IDQCDgjPXgADMSSWqz8cfea3vI1QRA4fzyCJ~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=A53Jfk8Sr5WLnnQUV8eX%2B%2FUX2GU%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oAABaCgQEDDAgUBFPnBXspfvhhpBREIsQKCqfC~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=WKqK7JjZqqhwstCQNY%2BlUdSevmA%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
  "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/owEe1LCjoGTfiMIYOAXAAL86QeOtUEDI5uQnHH~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=DN4ADcmVF67D5wckfUU3srU6dEw%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b",
];

// Distribute thumbnails across 5 columns, repeating as needed
const getColumnThumbs = (colIndex: number) => {
  const perCol = 4;
  const result: string[] = [];
  for (let i = 0; i < perCol; i++) {
    result.push(thumbnails[(colIndex * perCol + i) % thumbnails.length]);
  }
  return result;
};

const columns = [0, 1, 2, 3, 4].map(i => ({
  thumbs: getColumnThumbs(i),
  direction: i % 2 === 0 ? 'up' : 'down',
}));

const OperationalFlowSection = () => (
  <section className="relative z-10 w-full py-24 px-6 overflow-hidden">
    {/* ROTATING BACKGROUND THUMBNAILS */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 flex justify-around gap-0 opacity-[0.12]"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}
      >
        {columns.map((col, colIdx) => (
          <div
            key={colIdx}
            className={`flex flex-col gap-3 flex-1 min-w-0 ${col.direction === 'up' ? 'animate-marquee-v-up' : 'animate-marquee-v-down'}`}
          >
            {[...col.thumbs, ...col.thumbs].map((thumb, i) => (
              <div key={i} className="w-full h-[320px] rounded-2xl overflow-hidden shrink-0">
                <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#020105]/25" />
    </div>

    {/* CONTENT */}
    <div className="relative z-10 max-w-7xl mx-auto">
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
        <p className="mt-4 text-sm text-purple-400 font-semibold font-poppins tracking-wide">
          Em menos de 2 minutos, seu primeiro vídeo já está no ar.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        <CinematicCard 
          step="01"
          title="Escolha do Produto"
          subtitle="Análise de Tendências"
          image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"
          icon={ShoppingBag}
          tags={["Trendy", "Viral Score", "9.8"]}
          description="A gente encontra produtos com alta chance de vender — antes de todo mundo."
          stats={{ label: "Precisão", value: "98.4%" }}
        />
        <CinematicCard 
          step="02"
          title="Criação dos Vídeos"
          subtitle="Digital Actors"
          image="https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/oQzRsFyaAAAeAjIjAEFuePoD7fU3SLTEDIED5I~tplv-tiktokx-origin.image?dr=10395&x-expires=1775498400&x-signature=Bqw%2Fi5VYGiJvuRLVMzcJtB%2BMSZg%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast2b"
          icon={Cpu}
          tags={["Realismo", "4K Render"]}
          description="Um apresentador digital grava o vídeo pra você — parece gente de verdade, e fica pronto em minutos."
          stats={{ label: "Velocidade", value: "vídeo #12 gerado agora" }}
        />
        <CinematicCard 
          step="03"
          title="Postagem Automática"
          subtitle="Multi-Platform"
          image="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600"
          icon={Share2}
          tags={["TikTok", "Reels", "Shorts"]}
          description="O vídeo vai pro ar sozinho, com link nos comentários — você não precisa abrir nenhum app."
          stats={{ label: "Escala", value: "hook testado: POV…" }}
        />
        <CinematicCard 
          step="04"
          title="Vendas Acontecendo"
          subtitle="Resultados Reais"
          image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
          icon={TrendingUp}
          tags={["ROI", "Sales", "Cashout"]}
          description="Você acompanha as vendas caindo em tempo real. O sistema repete o processo com novos produtos automaticamente."
          stats={{ label: "Agora", value: "+3 vendas nas últimas 2h" }}
        />
      </div>

      <div className="mt-20 text-center">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group px-10 py-5 rounded-2xl bg-white text-black font-extrabold text-sm uppercase tracking-widest transition-all flex items-center gap-3 mx-auto shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
        >
          Começar com 1 produto agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  </section>
);

export default OperationalFlowSection;
