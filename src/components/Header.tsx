import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/auth";
import "../styles/Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="header">
      <div className="header-logo">
        <img src="/logo.png" alt="Alerty" className="header-logo-img" />
      </div>

      <nav className="header-nav">
        <button
          className={`header-nav-btn ${location.pathname === "/" ? "ativo" : ""}`}
          onClick={() => navigate("/")}
        >
          Meus clientes
        </button>

        <button
          className={`header-nav-btn ${location.pathname === "/relatorio" ? "ativo" : ""}`}
          onClick={() => navigate("/relatorio")}
        >
          Relatório
        </button>

        <button
          className={`header-nav-btn ${location.pathname === "/modalidades" ? "ativo" : ""}`}
          onClick={() => navigate("/modalidades")}
        >
          Modalidades
        </button>

        <button
          className={`header-nav-btn ${location.pathname === "/alertas" ? "ativo" : ""}`}
          onClick={() => navigate("/alertas")}
        >
          Alertas
        </button>

        <button
          className={`header-nav-btn ${location.pathname === "/whatsapp" ? "ativo" : ""}`}
          onClick={() => navigate("/whatsapp")}
        >
          WhatsApp
        </button>
      </nav>

      <div className="header-usuario">
        <span>Neto Lima</span>
        <button className="header-sair" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
