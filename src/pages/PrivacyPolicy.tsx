import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-black py-16 px-6 md:px-20 font-poppins">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <img src={logo} alt="PearlShop.io" className="h-8 w-auto brightness-0 mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Política de Privacidade</h1>
        <p className="text-xs text-zinc-400 mb-10">Última atualização: 5 de Abril de 2026</p>

        <div className="space-y-0 text-sm text-zinc-700 leading-relaxed">
          <p className="text-base text-zinc-800 mb-8">
            A PearlShop.io faz parte do ecossistema Pearl, que inclui também a plataforma PearlPost.io. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos os dados dos usuários ao utilizar nossos serviços.
          </p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">1. Introdução</h2>
          <p>A PearlShop.io é uma plataforma digital voltada à automação de criação de conteúdo, geração de vídeos com inteligência artificial e estruturação de lojas online baseadas em produtos do TikTok Shop. A PearlPost.io, integrada ao ecossistema, é responsável pela distribuição e publicação de conteúdo em redes sociais. Ambas operam de forma complementar, respeitando os limites de acesso e finalidade de dados.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">2. Dados coletados</h2>
          <p className="mb-3">Coletamos apenas os dados necessários para o funcionamento da plataforma:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nome e e-mail</li>
            <li>Identificadores de contas (OAuth)</li>
            <li>Dados do TikTok Shop (via API oficial)</li>
            <li>Dados técnicos (IP, dispositivo)</li>
            <li>Preferências de uso</li>
          </ul>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">3. Dados do TikTok Shop</h2>
          <p>Ao conectar sua conta ao TikTok Shop, acessamos apenas os dados autorizados pela API oficial para exibir produtos, criar lojas automáticas e gerar conteúdos. A PearlShop não executa publicação direta; esta função é delegada à PearlPost.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">4. Geração com IA</h2>
          <p>Vídeos, imagens e avatares são gerados com base nos dados do produto e nas preferências do usuário, que detém a responsabilidade pelo uso final.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">5. Distribuição (PearlPost)</h2>
          <p>A distribuição é feita via OAuth, permitindo publicação de vídeos e leitura de métricas sem que a PearlShop armazene tokens de publicação.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">6. Compartilhamento de dados</h2>
          <p>Seus dados podem ser compartilhados com a PearlPost.io, provedores de infraestrutura e APIs oficiais. Nunca vendemos dados pessoais em nenhuma circunstância.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">7. Segurança e localização</h2>
          <p>Os dados são armazenados em provedores de alta segurança no Brasil e nos Estados Unidos, utilizando criptografia HTTPS e controle de acesso baseado em privilégio mínimo.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">8. Retenção e direitos</h2>
          <p>Os dados são mantidos pelo tempo necessário para a operação. O usuário pode solicitar a exclusão total a qualquer momento, sendo processada em até 30 dias após o encerramento da conta.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">9. Conformidade e incidentes</h2>
          <p>Nos últimos 3 anos, não houve violações ou sanções. Em caso de incidentes, seguimos um protocolo rigoroso de contenção, análise e notificação.</p>

          <hr className="border-zinc-100 my-8" />
          <h2 className="text-lg font-bold mb-3">10. Cookies e pagamentos</h2>
          <p className="mb-2">Utilizamos cookies essenciais para autenticação e segurança do sistema.</p>
          <p>Pagamentos são processados via Stripe. Não armazenamos dados de cartão.</p>

          <hr className="border-zinc-100 my-8" />
          <div className="text-xs text-zinc-400 space-y-1">
            <p>© 2026 PearlShop.io • Ecossistema Pearl</p>
            <p>Contacto: suporte@pearlshop.io</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
