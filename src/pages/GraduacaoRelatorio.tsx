import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "../services/api";
import type { GraduacaoStatus } from "../types/Graduacao";
import Header from "../components/Header";
import { Award, Check } from "lucide-react";
import "../styles/GraduacaoRelatorio.css";

interface Servico {
  id: number;
  nome: string;
}

function GraduacaoRelatorio() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [idServicoFiltro, setIdServicoFiltro] = useState("");
  const [lista, setLista] = useState<GraduacaoStatus[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [graduandoId, setGraduandoId] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiGet<Servico[]>("/servicos").then(setServicos).catch(console.error);
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const query = idServicoFiltro ? `?idServico=${idServicoFiltro}` : "";
      const dados = await apiGet<GraduacaoStatus[]>(`/relatorios/aptos-graduar${query}`);
      setLista(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar relatório.");
    } finally {
      setCarregando(false);
    }
  }, [idServicoFiltro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function graduar(item: GraduacaoStatus) {
    if (!confirm(`Graduar ${item.nomeCliente} de ${item.nomeGraduacaoAtual} para ${item.nomeProximaGraduacao}?`)) return;

    setGraduandoId(item.idCliente);
    setErro("");
    try {
      await apiPost(`/clientes/${item.idCliente}/graduar`, { idServico: item.idServico });
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao graduar aluno.");
    } finally {
      setGraduandoId(null);
    }
  }

  return (
    <div className="pagina">
      <Header />

      <main className="graduacao-main">
        <div className="graduacao-topbar">
          <h1>Progressão de graduação</h1>
          <select value={idServicoFiltro} onChange={(e) => setIdServicoFiltro(e.target.value)}>
            <option value="">Todas as modalidades</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>

        {erro && <div className="graduacao-erro">{erro}</div>}

        {carregando ? (
          <div className="graduacao-vazio">Carregando...</div>
        ) : lista.length === 0 ? (
          <div className="graduacao-vazio">
            Nenhum aluno com graduação cadastrada ainda nessa modalidade.
          </div>
        ) : (
          <div className="graduacao-lista">
            {lista.map((item) => (
              <div key={`${item.idCliente}-${item.idServico}`} className="graduacao-row">
                <div className="graduacao-info">
                  <span className="graduacao-nome">{item.nomeCliente}</span>
                  <span className="graduacao-detalhe">
                    {item.nomeServico} · {item.nomeGraduacaoAtual} → {item.nomeProximaGraduacao}
                  </span>
                </div>

                <div className="graduacao-progresso-container">
                  <div className="graduacao-barra">
                    <div
                      className={`graduacao-barra-preenchida ${item.apto ? "apto" : ""}`}
                      style={{ width: `${item.progressoPercentual}%` }}
                    />
                  </div>
                  <span className="graduacao-progresso-texto">{item.progressoPercentual}%</span>
                </div>

                <div className="graduacao-acao">
                  {item.apto ? (
                    <button
                      className="graduacao-btn-graduar"
                      disabled={graduandoId === item.idCliente}
                      onClick={() => graduar(item)}
                    >
                      <Check size={14} strokeWidth={1.5} /> Apto — Graduar
                    </button>
                  ) : (
                    <span className="graduacao-badge-pendente">
                      <Award size={13} strokeWidth={1.5} /> Em progresso
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default GraduacaoRelatorio;
