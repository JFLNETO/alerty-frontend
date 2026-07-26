import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { estaLogado } from "./services/auth";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Relatorio from "./pages/Relatorio";
import Modalidades from "./pages/Modalidades";

function RotaProtegida({ children }: { children: React.ReactNode }) {
  if (!estaLogado()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Clientes />
            </RotaProtegida>
          }
        />
        <Route
          path="/relatorio"
          element={
            <RotaProtegida>
              <Relatorio />
            </RotaProtegida>
          }
        />
        <Route
          path="/modalidades"
          element={
            <RotaProtegida>
              <Modalidades />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
