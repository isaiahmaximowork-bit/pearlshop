import { useState } from 'react';
import { Heart, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import imgVendedorIa from '@/assets/reviews/vendedor_ia.jpg';
import imgMarcosIa from '@/assets/reviews/marcos_ia.jpg';
import imgMLoja from '@/assets/reviews/m_loja.jpg';
import imgLucasAds from '@/assets/reviews/lucas_ads.jpg';
import imgAfiliadoPro from '@/assets/reviews/afiliado_pro.jpg';
import imgUserShop from '@/assets/reviews/user_shop.jpg';
import imgTDigital from '@/assets/reviews/t_digital.jpg';
import imgCaioAfiliado from '@/assets/reviews/caio_afiliado.jpg';
import imgAnaUgc from '@/assets/reviews/ana_ugc.jpg';
import imgShopMaster from '@/assets/reviews/shop_master.jpg';
import imgGuiVendas from '@/assets/reviews/gui_vendas.jpg';
import imgDropshipLife from '@/assets/reviews/dropship_life.jpg';
import imgNandaStore from '@/assets/reviews/nanda_store.jpg';
import imgPedroIa from '@/assets/reviews/pedro_ia.jpg';
import imgViviIa from '@/assets/reviews/vivi_ia.jpg';
import imgThiagoAf from '@/assets/reviews/thiago_af.jpg';
import imgCrisVenda from '@/assets/reviews/cris_venda.jpg';
import imgRafaDigital from '@/assets/reviews/rafa_digital.jpg';

import avVendedorIa from '@/assets/reviews/avatar_vendedor_ia.jpg';
import avMarcosIa from '@/assets/reviews/avatar_marcos_ia.jpg';
import avMLoja from '@/assets/reviews/avatar_m_loja.jpg';
import avLucasAds from '@/assets/reviews/avatar_lucas_ads.jpg';
import avAfiliadoPro from '@/assets/reviews/avatar_afiliado_pro.jpg';
import avUserShop from '@/assets/reviews/avatar_user_shop.jpg';
import avTDigital from '@/assets/reviews/avatar_t_digital.jpg';
import avCaioAfiliado from '@/assets/reviews/avatar_caio_afiliado.jpg';
import avAnaUgc from '@/assets/reviews/avatar_ana_ugc.jpg';
import avShopMaster from '@/assets/reviews/avatar_shop_master.jpg';
import avGuiVendas from '@/assets/reviews/avatar_gui_vendas.jpg';
import avDropshipLife from '@/assets/reviews/avatar_dropship_life.jpg';
import avNandaStore from '@/assets/reviews/avatar_nanda_store.jpg';
import avPedroIa from '@/assets/reviews/avatar_pedro_ia.jpg';
import avViviIa from '@/assets/reviews/avatar_vivi_ia.jpg';
import avThiagoAf from '@/assets/reviews/avatar_thiago_af.jpg';
import avCrisVenda from '@/assets/reviews/avatar_cris_venda.jpg';
import avRafaDigital from '@/assets/reviews/avatar_rafa_digital.jpg';

interface ReviewCardProps {
  content: string;
  stats: { likes: string; views: string };
  handle: string;
  avatar: string;
  image: string;
  showBadge?: boolean;
  timeAgo?: string;
}

const ReviewCard = ({ content, stats, handle, avatar, image, showBadge, timeAgo }: ReviewCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(parseInt(stats.likes.replace(/\D/g, '')));

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };

  return (
    <div className="relative shrink-0 w-[320px] group bg-[#0c0c0c] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl hover:border-purple-500/30 transition-all duration-500 mx-4 review-card-float">
      <div className="absolute inset-0 z-0">
        <img src={image} alt="Post" loading="lazy" width={512} height={640} className="w-full h-full object-cover opacity-20 grayscale group-hover:opacity-40 group-hover:grayscale-0 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent" />
      </div>
      <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[240px]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={avatar} alt={handle} loading="lazy" width={32} height={32} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
            <span className="text-zinc-500 text-xs font-bold tracking-tight">{handle}</span>
            {timeAgo && (
              <span className="ml-auto text-[9px] font-bold text-green-400/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {timeAgo}
              </span>
            )}
          </div>
          <p className="text-white text-sm font-semibold leading-relaxed tracking-tight italic">"{content}"</p>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-1.5 transition-all active:scale-90">
              <Heart size={14} className={`${isLiked ? 'text-red-500 fill-red-500' : 'text-zinc-600'} transition-colors`} />
              <span className={`text-[10px] font-bold ${isLiked ? 'text-red-500' : 'text-zinc-500'}`}>{likeCount.toLocaleString('pt-BR')}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-zinc-600" />
              <span className="text-[10px] font-bold text-zinc-500">{stats.views}</span>
            </div>
          </div>
          {showBadge && (
            <div className="bg-purple-500/10 px-2 py-1 rounded-md">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Verificado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const allReviews: ReviewCardProps[] = [
  { handle: "@vendedor_ia", content: "postei esse vídeo sem aparecer e pegou 9.342 views em 2 dias. bizarro.", stats: { likes: "1.248", views: "9.342" }, avatar: avVendedorIa, image: imgVendedorIa, showBadge: true },
  { handle: "@marcos_ia", content: "caiu minha primeira comissão hoje. surreal. nem acreditei quando vi a notificação 🔥", stats: { likes: "248", views: "4.102" }, avatar: avMarcosIa, image: imgMarcosIa },
  { handle: "@m_loja", content: "fiz 2 vendas no primeiro dia com 1 produto. sem gravar nada.", stats: { likes: "3.281", views: "45.210" }, avatar: avMLoja, image: imgMLoja },
  { handle: "@lucas_ads", content: "subi o link na bio e as comissões começaram a cair. loja pronta em 30 segundos.", stats: { likes: "512", views: "6.742" }, avatar: avLucasAds, image: imgLucasAds },
  { handle: "@afiliado_pro", content: "subo 20 vídeos por dia em 5 minutos. já recuperei o investimento em 3 dias.", stats: { likes: "1.842", views: "18.109" }, avatar: avAfiliadoPro, image: imgAfiliadoPro },
  { handle: "@user_shop", content: "tá convertendo 3x mais que o link direto. 12.481 acessos hoje.", stats: { likes: "967", views: "12.481" }, avatar: avUserShop, image: imgUserShop },
  { handle: "@t_digital", content: "postei e do nada começou a subir view kkk nem esperava", stats: { likes: "329", views: "4.382" }, avatar: avTDigital, image: imgTDigital, timeAgo: "há 2 min" },
  { handle: "@caio_afiliado", content: "nem mexi direito e já deu resultado. bizarro.", stats: { likes: "112", views: "2.109" }, avatar: avCaioAfiliado, image: imgCaioAfiliado },
  { handle: "@ana.ugc", content: "os avatares são muito reais, o tom de voz parece gente de verdade.", stats: { likes: "894", views: "15.420" }, avatar: avAnaUgc, image: imgAnaUgc },
  { handle: "@shop_master", content: "2 vendas caindo agora enquanto tô no almoço. vlw pearlshop!", stats: { likes: "541", views: "8.763" }, avatar: avShopMaster, image: imgShopMaster, timeAgo: "agora" },
  { handle: "@gui.vendas", content: "postagem automática no reels e tiktok salvou meu dia.", stats: { likes: "201", views: "3.241" }, avatar: avGuiVendas, image: imgGuiVendas },
  { handle: "@dropship_life", content: "peguei o plano hoje e já tô com a loja ativa. prático demais.", stats: { likes: "45", views: "982" }, avatar: avDropshipLife, image: imgDropshipLife },
  { handle: "@nanda_store", content: "bati 5.431 views no primeiro post. a escala é real.", stats: { likes: "722", views: "5.431" }, avatar: avNandaStore, image: imgNandaStore },
  { handle: "@pedro.ia", content: "as expressões do avatar são sinistras de boas.", stats: { likes: "1.054", views: "22.981" }, avatar: avPedroIa, image: imgPedroIa },
  { handle: "@vivi_ia", content: "fiz minha primeira comissão de R$ 87,40 em 3h de post.", stats: { likes: "338", views: "6.102" }, avatar: avViviIa, image: imgViviIa, timeAgo: "online" },
  { handle: "@thiago_af", content: "economizando umas 5h de edição por dia. absurdo.", stats: { likes: "1.203", views: "14.562" }, avatar: avThiagoAf, image: imgThiagoAf },
  { handle: "@cris_venda", content: "a curadoria acertou o produto em cheio, tá convertendo muito.", stats: { likes: "492", views: "9.210" }, avatar: avCrisVenda, image: imgCrisVenda },
  { handle: "@rafa_digital", content: "rodando 10 perfis agora com um clique. absurdo.", stats: { likes: "2.193", views: "48.219" }, avatar: avRafaDigital, image: imgRafaDigital },
];

const row1 = allReviews.slice(0, 9);
const row2 = allReviews.slice(9, 18);

const ReviewSection = () => {
  return (
    <section className="relative z-10 py-12 md:py-24 px-4 md:px-6">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 60s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 60s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .review-card-float {
          animation: card-float 4s ease-in-out infinite;
        }
        .review-card-float:nth-child(2n) { animation-delay: 0.5s; }
        .review-card-float:nth-child(3n) { animation-delay: 1s; }
        .review-card-float:nth-child(5n) { animation-delay: 1.5s; }
      `}</style>

      <div className="w-full max-w-[1600px] mx-auto">
        <div className="text-center mb-20 space-y-6 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em]">Atualizado agora • novos vídeos sendo postados</span>
          </motion.div>

          <h2 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-tight font-poppins">
            FEED DE <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-800 uppercase tracking-tight">Resultados.</span>
          </h2>

          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">
            O que a comunidade está postando nas redes usando a PearlShop.
          </p>
        </div>

        <div className="space-y-12 mask-fade overflow-hidden py-10">
          <div className="relative flex overflow-hidden">
            <div className="flex animate-marquee-left pause-on-hover">
              {[...row1, ...row1].map((review, i) => (
                <ReviewCard key={`r1-${i}`} {...review} />
              ))}
            </div>
          </div>
          <div className="relative flex overflow-hidden">
            <div className="flex animate-marquee-right pause-on-hover">
              {[...row2, ...row2].map((review, i) => (
                <ReviewCard key={`r2-${i}`} {...review} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <div className="inline-flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020105] bg-zinc-800 overflow-hidden shadow-xl">
                    <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" loading="lazy" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-[#020105] bg-purple-600 flex items-center justify-center text-[10px] font-black shadow-xl">
                  +12k
                </div>
              </div>
              <p className="text-zinc-400 text-lg font-bold tracking-tight">
                +12.000 pessoas já estão <span className="text-white">rodando isso agora</span>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 md:px-14 py-5 md:py-7 rounded-[2rem] bg-white text-black font-black text-sm md:text-lg uppercase tracking-wider md:tracking-widest transition-all flex items-center gap-3 md:gap-4 shadow-[0_30px_90px_rgba(255,255,255,0.15)]"
            >
              COMEÇAR COM 1 PRODUTO AGORA <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
