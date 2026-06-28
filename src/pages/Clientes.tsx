import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../services/api";
import type { Cliente } from "../types/Clientes";
import { getStatusCliente, formatarData } from "../types/Clientes";
import Header from "../components/Header";
import ModalPagamento from "../components/ModalPagamento";
import ModalCadastrar from "../components/ModalCadastrar";
import ModalEditar from "../components/ModalEditar";
import "../styles/Clientes.css";

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [carregando, setCarregando] = useState(true);

  const [clientePagamento, setClientePagamento] = useState<Cliente | null>(null);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [mostrarCadastrar, setMostrarCadastrar] = useState(false);

  async function carregarClientes() {
    try {
      const ativo =
        filtroAtivo === "todos" ? undefined : filtroAtivo === "ativos";
      const query = ativo !== undefined ? `?ativo=${ativo}` : "";
      const dados = await apiGet<Cliente[]>(`/clientes${query}`);
      setClientes(dados);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, [filtroAtivo]);

  async function alterarStatus(cliente: Cliente) {
    try {
      await apiPatch(`/clientes/${cliente.id}/status`, {
        ativo: cliente.ativo ? "false" : "true",
      });
      carregarClientes();
    } catch (e) {
      console.error(e);
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="pagina">
      <Header />

      <main className="clientes-main">

        {/* ÁREA FIXA — topbar + cabeçalho da tabela */}
        <div className="clientes-fixo">
          <div className="clientes-topbar">
            <div className="clientes-busca">
              <span className="busca-icon">🔍</span>
              <input
                placeholder="Buscar cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button
              className="btn-cadastrar"
              onClick={() => setMostrarCadastrar(true)}
            >
              + Cadastrar
            </button>
          </div>

          <div className="clientes-tabela-header">
            <span>Nome</span>
            <span>Vencimento</span>
            <div className="clientes-filtros">
              <button
                className={`filtro-btn vencido ${filtroAtivo === "inativos" ? "ativo" : ""}`}
                onClick={() =>
                  setFiltroAtivo(
                    filtroAtivo === "inativos" ? "ativos" : "inativos"
                  )
                }
                title="Inativos"
              >
                ■
              </button>
              <button
                className={`filtro-btn ${filtroAtivo === "todos" ? "ativo" : ""}`}
                onClick={() =>
                  setFiltroAtivo(filtroAtivo === "todos" ? "ativos" : "todos")
                }
                title="Todos"
              >
                ≡
              </button>
              <button
                className={`filtro-btn em-dia ${filtroAtivo === "ativos" ? "ativo" : ""}`}
                onClick={() => setFiltroAtivo("ativos")}
                title="Ativos"
              >
                □
              </button>
            </div>
          </div>
        </div>

        {/* ÁREA QUE ROLA — apenas a lista */}
        <div className="clientes-scroll">
          {carregando ? (
            <div className="clientes-vazio">Carregando...</div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="clientes-vazio">Nenhum cliente encontrado.</div>
          ) : (
            <div className="clientes-lista">
              {clientesFiltrados.map((cliente) => {
                const status = getStatusCliente(cliente.dataVencimento);
                const precisaPagar = status === "vencido" || status === "hoje";

                return (
                  <div
                    key={cliente.id}
                    className={`cliente-row status-${status}`}
                    onClick={() => setClienteEditar(cliente)}
                  >
                    <span className="cliente-nome">{cliente.nome}</span>
                    <span className="cliente-vencimento">
                      {formatarData(cliente.dataVencimento)}
                    </span>
                    <div
                      className="cliente-acoes"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className={`btn-pagar ${!precisaPagar ? "pago" : ""}`}
                        onClick={() => setClientePagamento(cliente)}
                      >
                        ✓ {precisaPagar ? "Pagar" : "Pago"}
                      </button>
                      <button
                        className={`btn-inativar ${!cliente.ativo ? "reativar" : ""}`}
                        onClick={() => alterarStatus(cliente)}
                      >
                        {cliente.ativo ? "Inativar" : "Reativar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {clientePagamento && (
        <ModalPagamento
          cliente={clientePagamento}
          onFechar={() => setClientePagamento(null)}
          onSucesso={carregarClientes}
        />
      )}

      {clienteEditar && (
        <ModalEditar
          cliente={clienteEditar}
          onFechar={() => setClienteEditar(null)}
          onSucesso={carregarClientes}
        />
      )}

      {mostrarCadastrar && (
        <ModalCadastrar
          onFechar={() => setMostrarCadastrar(false)}
          onSucesso={carregarClientes}
        />
      )}
    </div>
  );
}

export default Clientes;
