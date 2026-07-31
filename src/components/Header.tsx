import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, obterNomeDono } from "../services/auth";
import { Menu, X } from "lucide-react";
import "../styles/Header.css";

const ITENS_NAV = [
  { rota: "/", label: "Meus clientes" },
  { rota: "/relatorio", label: "Relatório" },
  { rota: "/modalidades", label: "Modalidades" },
  { rota: "/alertas", label: "Alertas" },
  { rota: "/whatsapp", label: "WhatsApp" },
];

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const nomeDono = obterNomeDono();

  async function handleLogout() {
    await logout();
  }

  function irPara(rota: string) {
    navigate(rota);
    setMenuAberto(false);
  }

  return (
    <header className="header">
      <div className="header-logo">
        <img src="/logo.png" alt="Alerty" className="header-logo-img" />
      </div>

      <nav className={`header-nav ${menuAberto ? "aberto" : ""}`}>
        {ITENS_NAV.map((item) => (
          <button
            key={item.rota}
            className={`header-nav-btn ${location.pathname === item.rota ? "ativo" : ""}`}
            onClick={() => irPara(item.rota)}
          >
            {item.label}
          </button>
        ))}

        <div className="header-usuario-mobile">
          <span>{nomeDono}</span>
          <button className="header-sair" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      <div className="header-usuario">
        <span>{nomeDono}</span>
        <button className="header-sair" onClick={handleLogout}>
          Sair
        </button>
      </div>

      <button
        className="header-menu-btn"
        onClick={() => setMenuAberto(!menuAberto)}
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
      >
        {menuAberto ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
      </button>
    </header>
  );
}

export default Header;
