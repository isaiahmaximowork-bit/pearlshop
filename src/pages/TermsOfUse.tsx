import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

const TermsOfUse = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-black py-16 px-6 md:px-20 font-poppins">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <img src={logo} alt="PearlShop.io" className="h-8 w-auto brightness-0 mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Termos de Uso</h1>
        <p className="text-xs text-zinc-400 mb-10">Última atualização: 5 de Abril de 2026</p>

        <div className="space-y-0 text-sm text-zinc-700 leading-relaxed">
          <p className="text-base text-zinc-800 mb-8">
            Bem-vindo à PearlShop.io. Ao acessar ou utilizar nossos serviços, você concorda com os presentes Termos de Uso. A PearlShop faz parte do ecossistema Pearl, que inclui também a plataforma PearlPost.io.
          </p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">1. Descrição dos serviços</h2>
          <p>A PearlShop.io é uma plataforma que permite a criação automatizada de conteúdos (vídeos, imagens e avatares com IA), estruturação de lojas online e gestão de produtos afiliados. A distribuição e publicação de conteúdo em redes sociais é realizada pela PearlPost.io.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">2. Elegibilidade</h2>
          <p>Você declara possuir pelo menos 18 anos ou autorização legal, possuindo plena capacidade para celebrar este contrato.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">3. Uso aceitável</h2>
          <p>O usuário concorda em utilizar a plataforma para fins legais, sem violar direitos de terceiros ou praticar spam e fraudes.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">4. Responsabilidade do usuário</h2>
          <p className="mb-3">Você é o único responsável por:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Conteúdos gerados e publicados</li>
            <li>Links e produtos promovidos</li>
            <li>Cumprimento das regras de plataformas terceiras</li>
          </ul>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">5. Conteúdo gerado por IA</h2>
          <p>O usuário é responsável pelo uso final desses conteúdos, incluindo a adequação às regras das plataformas sociais, direitos de uso comercial e conformidade com a legislação aplicável.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">6. Propriedade intelectual</h2>
          <p>Todos os direitos relacionados à marca PearlShop, PearlPost, interface e tecnologia pertencem exclusivamente à empresa. É proibida a cópia ou engenharia reversa.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">7. Pagamentos e reembolso</h2>
          <p className="mb-2">Garantia de 7 dias conforme a legislação. O usuário pode cancelar a assinatura a qualquer momento.</p>
          <p>Após o prazo de 7 dias, não há reembolso de valores já pagos.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">8. Limitação de responsabilidade</h2>
          <p>Não garantimos resultados financeiros, volume de vendas ou desempenho de conteúdo. O uso da plataforma tecnológica é de inteira responsabilidade do usuário.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">9. Encerramento de conta</h2>
          <p>Podemos suspender ou encerrar contas que violem estes termos, utilizem a plataforma de forma abusiva ou representem risco à operação.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">10. Alterações</h2>
          <p>Estes termos podem ser atualizados periodicamente. Recomendamos a consulta regular desta página.</p>

          <hr className="border-zinc-100 my-8" />
          <div className="text-xs text-zinc-400 space-y-1">
            <p>© 2026 PearlShop.io • Termos e Condições</p>
            <p>Contacto: suporte@pearlshop.io</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
