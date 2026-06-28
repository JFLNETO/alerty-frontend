import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import Header from "../components/Header";
import "../styles/Relatorio.css";

interface Pagamento {
  id: number;
  clienteId: string;
  idEmpresa: number;
  valor: number;
  dataPagamento: string;
  dataVencimentoAnterior: string;
}

interface RelatorioResponse {
  totalRecebido: number;
  quantidadePagamentos: number;
  pagamentos: Pagamento[];
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatarValor(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Relatorio() {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [dataInicio, setDataInicio] = useState(primeiroDia);
  const [dataFim, setDataFim] = useState(ultimoDia);
  const [relatorio, setRelatorio] = useState<RelatorioResponse | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function buscar() {
    setCarregando(true);
    try {
      const dados = await apiGet<RelatorioResponse>(
        `/relatorios/pagamentos?dataInicio=${dataInicio}&dataFim=${dataFim}`
      );
      setRelatorio(dados);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  return (
    <div className="pagina">
      <Header />

      <main className="relatorio-main">
        <div className="relatorio-filtros">
          <div className="relatorio-campo">
            <span>📅</span>
            <label>Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="relatorio-campo">
            <span>📅</span>
            <label>Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <button className="relatorio-btn" onClick={buscar}>
            Buscar
          </button>
        </div>

        {carregando ? (
          <div className="relatorio-vazio">Carregando...</div>
        ) : relatorio ? (
          <div className="relatorio-tabela-container">
            <table className="relatorio-tabela">
              <thead>
                <tr>
                  <th>Data Pagamento</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Data Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.pagamentos.map((p) => (
                  <tr key={p.id}>
                    <td>{formatarData(p.dataPagamento)}</td>
                    <td>{p.clienteId}</td>
                    <td>{formatarValor(p.valor)}</td>
                    <td>{formatarData(p.dataVencimentoAnterior)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="relatorio-totais">
                  <td colSpan={4}>
                    <div className="relatorio-total">
                      <span>Total de entrada:</span>
                      <strong>{formatarValor(relatorio.totalRecebido)}</strong>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="relatorio-vazio">Nenhum dado encontrado.</div>
        )}
      </main>
    </div>
  );
}

export default Relatorio;
