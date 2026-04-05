import { 
  Lock, UserPlus, Shield, Mail, 
  Globe, FileText, Cpu, CreditCard, 
  ShieldOff, UserMinus, RefreshCw, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

const TermsOfUse = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-black py-20 px-6 md:px-20 font-poppins selection:bg-zinc-200">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-10 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <div className="mb-16 border-b border-zinc-100 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="PearlShop.io" className="h-10 w-auto brightness-0" />
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-none text-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            Termos de Uso
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-black font-bold uppercase tracking-widest text-[10px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <span>PearlShop Autonomous Systems</span>
            <span className="hidden md:block text-zinc-200">•</span>
            <span>Última atualização: 5 de Abril de 2026</span>
          </div>
        </div>

        <div className="space-y-16 text-zinc-600 leading-relaxed font-medium">
          <div className="space-y-4">
            <p className="text-xl text-zinc-800 font-medium leading-relaxed">
              Bem-vindo à PearlShop.io. Ao acessar ou utilizar nossos serviços, você concorda com os presentes Termos de Uso. A PearlShop faz parte do ecossistema Pearl, que inclui também a plataforma PearlPost.io.
            </p>
          </div>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">01</span>
              Descrição dos serviços
            </h2>
            <p>
              A PearlShop.io é uma plataforma que permite a criação automatizada de conteúdos (vídeos, imagens e avatares com IA), estruturação de lojas online e gestão de produtos afiliados. A distribuição e publicação de conteúdo em redes sociais é realizada pela PearlPost.io.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <UserPlus size={32} className="text-black mb-4" />
              <h3 className="text-lg font-black uppercase tracking-widest mb-3">Elegibilidade</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Você declara possuir pelo menos 18 anos ou autorização legal, possuindo plena capacidade para celebrar este contrato.</p>
            </div>
            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <CheckCircle2 size={32} className="text-black mb-4" />
              <h3 className="text-lg font-black uppercase tracking-widest mb-3">Uso Seguro</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">O usuário concorda em utilizar a plataforma para fins legais, sem violar direitos de terceiros ou praticar spam e fraudes.</p>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">04</span>
              Responsabilidade do usuário
            </h2>
            <div className="space-y-4">
              <p>Você é o único responsável por:</p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Conteúdos Gerados', icon: Cpu },
                  { label: 'Links Promovidos', icon: Globe },
                  { label: 'Regras de Terceiros', icon: Shield }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                    <item.icon size={20} className="text-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">05</span>
              Conteúdo gerado por IA
            </h2>
            <p>
              O usuário é responsável pelo uso final desses conteúdos, incluindo a adequação às regras das plataformas sociais, direitos de uso comercial e conformidade com a legislação aplicável.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">07</span>
              Propriedade intelectual
            </h2>
            <p>Todos os direitos relacionados à marca PearlShop, PearlPost, interface e tecnologia pertencem exclusivamente à empresa. É proibida a cópia ou engenharia reversa.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">08</span>
              Pagamentos e Reembolso
            </h2>
            <div className="p-8 border-2 border-dashed border-zinc-100 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3 text-black">
                <CreditCard size={20} />
                <span className="font-bold">Garantia de 7 dias conforme a legislação.</span>
              </div>
              <p className="text-sm">O usuário pode cancelar a assinatura a qualquer momento. Após o prazo de 7 dias, não há reembolso de valores já pagos.</p>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-12 pt-8">
            <section className="space-y-4">
              <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-2">
                <ShieldOff size={18} /> Limitação
              </h2>
              <p className="text-sm">
                Não garantimos resultados financeiros, volume de vendas ou desempenho de conteúdo. O uso da plataforma tecnológica é de inteira responsabilidade do usuário.
              </p>
            </section>
            <section className="space-y-4">
              <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-2">
                <UserMinus size={18} /> Encerramento
              </h2>
              <p className="text-sm">
                Podemos suspender ou encerrar contas que violem estes termos, utilizem a plataforma de forma abusiva ou representem risco à operação.
              </p>
            </section>
          </div>

          <section className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-100 rounded-xl"><Lock size={20} /></div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-xs mb-1">Segurança</h4>
                  <p className="text-xs text-zinc-500">Proibida a exploração de falhas ou compartilhamento indevido de contas.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-100 rounded-xl"><RefreshCw size={20} /></div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-xs mb-1">Alterações</h4>
                  <p className="text-xs text-zinc-500">Estes termos podem ser atualizados periodicamente sem aviso prévio.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-16 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-2">© 2026 PearlShop.io • Termos e Condições</p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail size={14} className="text-zinc-400" />
                <span className="text-sm font-bold text-black">suporte@pearlshop.io</span>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-40">
              <FileText size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">User Agreement v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
