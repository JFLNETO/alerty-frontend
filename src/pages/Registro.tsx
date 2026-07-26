import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "../services/auth";
import "../styles/Login.css";

function Registro() {
  const navigate = useNavigate();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nomeDono, setNomeDono] = useState("");
  const [whatsappDono, setWhatsappDono] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleRegistrar() {
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setCarregando(true);
    try {
      await registrar({ nomeEmpresa, nomeDono, whatsappDono, email, senha });
      navigate("/bem-vindo");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="Alerty" className="login-logo-img" />
        </div>

        <p className="login-subtitle">Crie a conta da sua academia</p>

        {erro && <div className="login-erro">{erro}</div>}

        <div className="login-campo">
          <label>Nome da academia</label>
          <input
            placeholder="Ex: CT Fuzille"
            value={nomeEmpresa}
            onChange={(e) => setNomeEmpresa(e.target.value)}
          />
        </div>

        <div className="login-campo">
          <label>Seu nome</label>
          <input
            placeholder="Nome do responsável"
            value={nomeDono}
            onChange={(e) => setNomeDono(e.target.value)}
          />
        </div>

        <div className="login-campo">
          <label>Seu WhatsApp</label>
          <input
            placeholder="79999990000"
            value={whatsappDono}
            onChange={(e) => setWhatsappDono(e.target.value)}
          />
        </div>

        <div className="login-campo">
          <label>E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-campo">
          <label>Senha</label>
          <input
            type="password"
            placeholder="mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <div className="login-campo">
          <label>Confirmar senha</label>
          <input
            type="password"
            placeholder="••••••"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegistrar()}
          />
        </div>

        <button className="login-btn" onClick={handleRegistrar} disabled={carregando}>
          {carregando ? "Criando conta..." : "Criar conta"}
        </button>

        <button
          className="login-link"
          onClick={() => navigate("/login")}
          type="button"
        >
          Já tem conta? Entrar
        </button>
      </div>
    </div>
  );
}

export default Registro;
