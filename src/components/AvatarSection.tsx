import { Camera, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import avatarInputPhoto from '@/assets/avatar-input-photo.png';
import avatarOutputVideo from '@/assets/avatar-output-video.mp4';
import avatarPromptOutput from '@/assets/avatar-prompt-output.png';

const StepBadge = ({ step, icon: Icon }: { step: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4 w-fit">
    <Icon size={12} className="text-purple-500" />
    <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Passo {step}</span>
  </div>
);

const AvatarCard = ({ step, icon, title, description, visual, delay }: {
  step: string;
  icon: React.ElementType;
  title: string;
  description: string;
  visual: React.ReactNode;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="flex-1 bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-2xl relative overflow-hidden group"
  >
    <StepBadge step={step} icon={icon} />
    <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tighter mb-8 leading-tight">
      {title}
    </h3>
    <div className="flex-1 mb-8">
      {visual}
    </div>
    <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed font-poppins">
      {description}
    </p>
  </motion.div>
);

const AvatarSection = () => (
  <section className="relative z-10 w-full py-12 md:py-24 px-4 md:px-6">
    <style>{`
      .avatar-label {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        padding: 4px 10px;
        border-radius: 99px;
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    `}</style>

    <div className="max-w-7xl mx-auto w-full">
      {/* HEADER */}
      <div className="text-center mb-10 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8"
        >
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.4em]">Avatares IA • Novo</span>
        </motion.div>

        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-6 md:mb-8 font-poppins text-white">
          Crie vídeos UGC com avatares IA <br />
          <span className="text-gradient-purple uppercase tracking-tight">que realmente convertem</span>
        </h2>

        <p className="text-zinc-500 text-base md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-4">
          Escolha um avatar, coloque seu produto e deixe ele criar vídeos que vendem por você.
        </p>
        <p className="text-purple-400 text-base md:text-lg font-semibold">
          ⚡ Em menos de 2 minutos, seu primeiro vídeo já está pronto.
        </p>
      </div>

      {/* CARDS */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <AvatarCard
          step="1"
          icon={Camera}
          title="Escolha um rosto. Ele começa a vender por você."
          description="Escolha ou crie um avatar, gere vídeos automaticamente e venda no TikTok Shop sem gravar nada."
          delay={0.1}
          visual={
            <div className="flex items-center gap-4 relative">
              <div className="flex-1 aspect-square rounded-3xl overflow-hidden relative border border-zinc-200">
                <img src={avatarInputPhoto} className="w-full h-full object-cover" alt="Foto de entrada" />
                <div className="avatar-label">
                  <Camera size={10} className="text-white" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">Foto de Entrada</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-lg z-10">
                <ArrowRight size={18} className="text-white" />
              </div>
              <div className="flex-1 aspect-square rounded-3xl overflow-hidden relative border-2 border-purple-500 shadow-xl">
                <video src={avatarOutputVideo} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                <div className="avatar-label">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">Avatar IA</span>
                </div>
              </div>
            </div>
          }
        />

        <AvatarCard
          step="2"
          icon={Sparkles}
          title="Crie um avatar do jeito que quiser"
          description="Descreva a pessoa exata que você quer — idade, estilo, expressão, roupa — e a IA a cria instantaneamente usando ou mostrando o seu produto."
          delay={0.2}
          visual={
            <div className="flex items-center gap-4 relative">
              <div className="flex-1 aspect-square rounded-3xl overflow-hidden relative border border-zinc-200 bg-zinc-50 p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Prompt IA</span>
                </div>
                <p className="text-zinc-600 text-[11px] italic leading-relaxed font-medium">
                  "Uma mulher morena de olhos verdes usando um vestido longo vermelho, usando um batom vermelho, luz natural, pele perfeita, Ultra realista 4k na Grécia."
                </p>
                <div className="mt-6 w-full h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Gerar Avatar →</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-lg z-10">
                <ArrowRight size={18} className="text-white" />
              </div>
              <div className="flex-1 aspect-square rounded-3xl overflow-hidden relative border-2 border-purple-500 shadow-xl">
                <img src={avatarPromptOutput} className="w-full h-full object-cover" alt="Avatar gerado por prompt" />
                <div className="avatar-label">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">Avatar IA</span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* CTA */}
      <div className="mt-12 md:mt-20 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group px-8 md:px-12 py-5 md:py-6 rounded-3xl bg-purple-600 text-white font-black text-base md:text-lg uppercase tracking-tighter transition-all flex items-center gap-4 mx-auto shadow-[0_20px_50px_rgba(147,51,234,0.3)]"
        >
          Testar com 1 produto <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
        </motion.button>
      </div>
    </div>
  </section>
);

export default AvatarSection;
