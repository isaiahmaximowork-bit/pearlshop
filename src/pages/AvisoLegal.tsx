import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AvisoLegal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <h1 className="text-3xl font-black tracking-tight mb-8">Aviso Legal</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Sobre os produtos</h2>
            <p>
              Todos os produtos exibidos nesta loja são vendidos exclusivamente através do{" "}
              <strong className="text-foreground">TikTok Shop</strong>. Ao clicar em "Comprar", você será
              redirecionado para a página do produto no TikTok, onde toda a transação será realizada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Responsabilidade</h2>
            <p>
              A <strong className="text-foreground">PearlShop.io</strong> é apenas uma plataforma de vitrine e
              não se responsabiliza por entregas, trocas, devoluções, qualidade dos produtos ou qualquer problema
              decorrente da compra. Qualquer questão relacionada ao produto deve ser tratada diretamente com o
              vendedor responsável no TikTok Shop.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Dados pessoais</h2>
            <p>
              Nenhum dado pessoal é coletado por esta loja. Ao utilizar este site, você concorda com os termos acima.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Contato</h2>
            <p>
              Para dúvidas sobre a plataforma PearlShop.io, entre em contato através do nosso site principal em{" "}
              <a href="https://pearlshop.io" className="text-primary hover:underline">pearlshop.io</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">© 2026 PearlShop.io — Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default AvisoLegal;
