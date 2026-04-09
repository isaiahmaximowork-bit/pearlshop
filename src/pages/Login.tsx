import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

import thumb1 from '@/assets/thumbnails/video1.jpg';
import thumb2 from '@/assets/thumbnails/video2.jpg';
import thumb3 from '@/assets/thumbnails/video3.jpg';
import thumb4 from '@/assets/thumbnails/video4.jpg';
import thumb5 from '@/assets/thumbnails/video5.jpg';
import thumb6 from '@/assets/thumbnails/video6.jpg';
import thumb7 from '@/assets/thumbnails/video7.jpg';

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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: integrate with Supabase auth
    setTimeout(() => {
      setIsLoading(false);
      navigate('/app');
    }, 1500);
  };

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
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-[#020105]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020105] via-transparent to-[#020105]" />
      </div>

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-[#0a0a12]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <img src={logo} alt="PearlShop" className="h-8 object-contain" />
              <span className="text-xl font-extrabold text-white tracking-tight font-poppins">PearlShop<span className="font-bold italic bg-gradient-to-b from-purple-400 to-purple-700 bg-clip-text text-transparent">.io</span></span>
            </div>
            <p className="text-zinc-500 text-sm font-poppins">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button type="button" className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit */}
            <div className="gemini-pill-wrapper w-full [--border-size:0px] hover:[--border-size:6px] transition-all">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group/btn w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.4)] transition-all disabled:opacity-60 relative z-[2] overflow-hidden"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="relative flex items-center gap-2">
                    Entrar
                    <ArrowRight size={16} className="translate-x-4 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all duration-300" />
                  </span>
                )}
              </motion.button>
            </div>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-zinc-500 mt-6 font-poppins">
            Não tem uma conta?{' '}
            <button className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Criar conta
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
