import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, User, AtSign, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

import thumb1 from '@/assets/thumbnails/video1.jpg';
import thumb2 from '@/assets/thumbnails/video2.jpg';
import thumb3 from '@/assets/thumbnails/video3.jpg';
import thumb4 from '@/assets/thumbnails/video4.jpg';
import thumb5 from '@/assets/thumbnails/video5.jpg';
import thumb6 from '@/assets/thumbnails/video6.jpg';
import thumb7 from '@/assets/thumbnails/video7.jpg';

import banana from '@/assets/avatars/banana.jpg';
import grape from '@/assets/avatars/grape.jpg';
import orange from '@/assets/avatars/orange.jpg';
import peach from '@/assets/avatars/peach.jpg';
import pineapple from '@/assets/avatars/pineapple.jpg';
import strawberry from '@/assets/avatars/strawberry.jpg';
import watermelon from '@/assets/avatars/watermelon.jpg';
import apple from '@/assets/avatars/apple.jpg';

const avatars = [
  { id: 'strawberry', src: strawberry, label: 'Morango' },
  { id: 'grape', src: grape, label: 'Uva' },
  { id: 'orange', src: orange, label: 'Laranja' },
  { id: 'peach', src: peach, label: 'Pêssego' },
  { id: 'banana', src: banana, label: 'Banana' },
  { id: 'pineapple', src: pineapple, label: 'Abacaxi' },
  { id: 'watermelon', src: watermelon, label: 'Melancia' },
  { id: 'apple', src: apple, label: 'Maçã' },
];

const thumbnails = [thumb1, thumb2, thumb3, thumb4, thumb5, thumb6, thumb7];

const getColumnThumbs = (colIndex: number) => {
  const perCol = 5;
  const result: string[] = [];
  for (let i = 0; i < perCol; i++) {
    result.push(thumbnails[(colIndex * perCol + i) % thumbnails.length]);
  }
  return result;
};

const columns = [0, 1, 2, 3, 4, 5, 6].map(i => ({
  thumbs: getColumnThumbs(i),
  direction: i % 2 === 0 ? 'up' : 'down',
}));

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setIsLoading(true);
    

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://pearlshop.io/login',
        data: {
          name,
          avatar_id: selectedAvatarId || 'strawberry',
          tiktok_handle: tiktokHandle,
        },
      },
    });

    if (signUpError) {
      setIsLoading(false);
      toast.error(signUpError.message);
      return;
    }

    setIsLoading(false);
    toast.success('Conta criada com sucesso!');
    navigate('/login');
  };

  const canProceedStep1 = email.length > 0 && password.length >= 6;
  const canProceedStep2 = name.length > 0 && tiktokHandle.length > 0;
  const canFinish = selectedAvatarId !== null;

  const inputClass = "w-full h-12 pl-11 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all";
  const inputClassPassword = "w-full h-12 pl-11 pr-12 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020105] flex items-center justify-center">
      {/* ROTATING BACKGROUND THUMBNAILS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 flex justify-around gap-2 opacity-[0.15]"
          style={{
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%)',
          }}
        >
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              className={`flex flex-col gap-3 flex-1 min-w-0 ${col.direction === 'up' ? 'animate-marquee-v-up' : 'animate-marquee-v-down'}`}
            >
              {[...col.thumbs, ...col.thumbs, ...col.thumbs].map((thumb, i) => (
                <div key={i} className="w-full h-[280px] rounded-2xl overflow-hidden shrink-0">
                  <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[#020105]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020105] via-transparent to-[#020105]" />
      </div>

      {/* REGISTER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-[#0a0a12]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          {/* Logo / Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <img src={logo} alt="PearlShop" className="h-8 object-contain" />
              <span className="text-xl font-extrabold text-white tracking-tight font-poppins">PearlShop<span className="font-bold italic bg-gradient-to-b from-purple-400 to-purple-700 bg-clip-text text-transparent">.io</span></span>
            </div>
            <p className="text-zinc-500 text-sm font-poppins">Crie sua conta para começar</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { id: 1, label: 'Credenciais' },
              { id: 2, label: 'Informações sociais' },
              { id: 3, label: 'Sua cara na PearlShop' },
            ].map((s) => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="relative w-full h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 h-full w-full rounded-full bg-primary"
                    initial={false}
                    animate={{
                      scaleX: step >= s.id ? 1 : 0,
                      originX: step >= s.id ? 0 : 1,
                    }}
                    style={step === s.id ? { boxShadow: '0 0 12px rgba(124,58,237,0.5)' } : {}}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <AnimatePresence mode="wait">
                  {step === s.id && (
                    <motion.span
                      key={s.label}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[10px] font-semibold text-primary tracking-wide"
                    >
                      {s.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="relative overflow-hidden min-h-[220px]">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">E-mail</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className={inputClassPassword} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nome</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" required className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">@ no TikTok</label>
                    <div className="relative">
                      <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input type="text" value={tiktokHandle} onChange={(e) => setTiktokHandle(e.target.value)} placeholder="@seuusuario" required className={inputClass} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4"
                >
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">Escolha seu avatar</p>
                  <div className="grid grid-cols-4 gap-3 justify-items-center">
                    {avatars.map(av => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(av.id)}
                        className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ring-2 ${
                          selectedAvatarId === av.id
                            ? 'ring-primary scale-110 shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                            : 'ring-transparent hover:ring-white/20 hover:scale-105'
                        }`}
                      >
                        <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
                        {selectedAvatarId === av.id && (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                            <Check size={20} className="text-white drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <motion.button
                type="button"
                onClick={goBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-12 px-5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 font-medium text-sm flex items-center gap-2 hover:bg-white/[0.08] transition-all"
              >
                <ArrowLeft size={16} /> Voltar
              </motion.button>
            )}

            <div className="gemini-pill-wrapper hover-only flex-1">
              {step < 3 ? (
                <motion.button
                  type="button"
                  onClick={goNext}
                  disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/btn w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.4)] transition-all disabled:opacity-40 relative z-[2] overflow-hidden"
                >
                  <span className="relative flex items-center gap-2">
                    Continuar
                    <ArrowRight size={16} className="translate-x-4 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all duration-300" />
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canFinish || isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/btn w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.4)] transition-all disabled:opacity-40 relative z-[2] overflow-hidden"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="relative flex items-center gap-2">
                      Criar conta
                      <ArrowRight size={16} className="translate-x-4 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all duration-300" />
                    </span>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-zinc-500 mt-6 font-poppins">
            Já tem uma conta?{' '}
            <button onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Entrar
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
