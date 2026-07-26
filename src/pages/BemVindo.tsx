import { useNavigate } from "react-router-dom";
import { Tag, MessageCircle, Bell, ArrowRight } from "lucide-react";
import "../styles/BemVindo.css";

function BemVindo() {
  const navigate = useNavigate();

  return (
    <div className="pagina">
      <main className="bemvindo-main">
        <h1>🎉 Conta criada!</h1>
        <p className="bemvindo-subtitulo">
          Faltam 3 passos rápidos antes de cadastrar o primeiro aluno.
        </p>

        <div className="bemvindo-lista">
          <button className="bemvindo-passo" onClick={() => navigate("/modalidades")}>
            <div className="bemvindo-passo-icone"><Tag size={18} strokeWidth={1.5} /></div>
            <div className="bemvindo-passo-texto">
              <strong>Cadastre suas modalidades</strong>
              <span>Ex: Jiu-Jitsu, Muay Thai — precisa de pelo menos uma antes de cadastrar clientes.</span>
            </div>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>

          <button className="bemvindo-passo" onClick={() => navigate("/whatsapp")}>
            <div className="bemvindo-passo-icone"><MessageCircle size={18} strokeWidth={1.5} /></div>
            <div className="bemvindo-passo-texto">
              <strong>Conecte o WhatsApp</strong>
              <span>Escaneie o QR code com o número que a academia já usa — é por ele que os alertas saem.</span>
            </div>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>

          <button className="bemvindo-passo" onClick={() => navigate("/alertas")}>
            <div className="bemvindo-passo-icone"><Bell size={18} strokeWidth={1.5} /></div>
            <div className="bemvindo-passo-texto">
              <strong>Revise o alerta padrão</strong>
              <span>Já criamos um alerta pra você (aviso no dia do vencimento) — ajuste o texto se quiser.</span>
            </div>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        <button className="bemvindo-pular" onClick={() => navigate("/")}>
          Ir direto para o painel
        </button>
      </main>
    </div>
  );
}

export default BemVindo;
