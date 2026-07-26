import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiDelete } from "../services/api";
import type { RegraAlerta } from "../types/RegraAlerta";
import { descreverRegra } from "../types/RegraAlerta";
import Header from "../components/Header";
import ModalCadastrarAlerta from "../components/ModalCadastrarAlerta";
import ModalEditarAlerta from "../components/ModalEditarAlerta";
import { Plus, Pencil, Trash2 } from "lucide-react";
import "../styles/Modalidades.css";

function Alertas() {
  const [regras, setRegras] = useState<RegraAlerta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [regraEditar, setRegraEditar] = useState<RegraAlerta | null>(null);
  const [mostrarCadastrar, setMostrarCadastrar] = useState(false);

  async function carregarRegras() {
    try {
      const dados = await apiGet<RegraAlerta[]>("/alertas");
      setRegras(dados);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRegras();
  }, []);

  async function alternarAtivo(regra: RegraAlerta) {
    setErro("");
    try {
      await apiPatch(`/alertas/${regra.id}/status`, { ativo: (!regra.ativo).toString() });
      carregarRegras();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar o alerta.");
    }
  }

  async function excluir(regra: RegraAlerta) {
    if (!confirm(`Excluir este alerta (${descreverRegra(regra)})?`)) return;

    try {
      await apiDelete(`/alertas/${regra.id}`);
      carregarRegras();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="pagina">
      <Header />

      <main className="modalidades-main">
        <div className="modalidades-topbar">
          <h1>Alertas de vencimento</h1>
          <button className="btn-cadastrar" onClick={() => setMostrarCadastrar(true)}>
            <Plus size={14} strokeWidth={1.5} /> Novo alerta
          </button>
        </div>

        {erro && <div className="modal-erro" style={{ marginBottom: 16 }}>{erro}</div>}

        {carregando ? (
          <div className="modalidades-vazio">Carregando...</div>
        ) : regras.length === 0 ? (
          <div className="modalidades-vazio">Nenhum alerta configurado ainda.</div>
        ) : (
          <div className="modalidades-lista">
            {regras.map((regra) => (
              <div key={regra.id} className="modalidade-row">
                <span className="modalidade-nome">{descreverRegra(regra)}</span>
                <span className="modalidade-valor" style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {regra.mensagem}
                </span>
                <div className="modalidade-acoes">
                  <button
                    className={`btn-inativar ${!regra.ativo ? "reativar" : ""}`}
                    onClick={() => alternarAtivo(regra)}
                    style={{ width: "auto" }}
                  >
                    {regra.ativo ? "Ativo" : "Inativo"}
                  </button>
                  <button className="btn-icone" onClick={() => setRegraEditar(regra)} title="Editar">
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button className="btn-icone perigo" onClick={() => excluir(regra)} title="Excluir">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {mostrarCadastrar && (
        <ModalCadastrarAlerta
          onFechar={() => setMostrarCadastrar(false)}
          onSucesso={carregarRegras}
        />
      )}

      {regraEditar && (
        <ModalEditarAlerta
          regra={regraEditar}
          onFechar={() => setRegraEditar(null)}
          onSucesso={carregarRegras}
        />
      )}
    </div>
  );
}

export default Alertas;
