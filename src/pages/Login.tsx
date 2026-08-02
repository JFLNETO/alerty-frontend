import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../services/auth";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [manterConectado, setManterConectado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha, manterConectado);
      navigate("/");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao fazer login.");
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

        <p className="login-subtitle">Gestão de mensalidades</p>

        {erro && <div className="login-erro">{erro}</div>}

        <div className="login-campo">
          <label>E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className="login-campo">
          <label>Senha</label>
          <div className="login-senha-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              type="button"
              className="login-senha-toggle"
              onClick={() => setMostrarSenha((v) => !v)}
              tabIndex={-1}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <label className="login-manter">
          <input
            type="checkbox"
            checked={manterConectado}
            onChange={(e) => setManterConectado(e.target.checked)}
          />
          Manter conectado
        </label>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <button
          className="login-link"
          onClick={() => navigate("/registro")}
          type="button"
        >
          Ainda não tem conta? Cadastre sua academia
        </button>
      </div>
    </div>
  );
}

export default Login;
