import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../services/api";
import type { Modalidade } from "../types/Modalidade";
import { formatarRecorrencia } from "../types/Modalidade";
import Header from "../components/Header";
import ModalCadastrarModalidade from "../components/ModalCadastrarModalidade";
import ModalEditarModalidade from "../components/ModalEditarModalidade";
import { Plus, Pencil, Trash2 } from "lucide-react";
import "../styles/Modalidades.css";

function Modalidades() {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalidadeEditar, setModalidadeEditar] = useState<Modalidade | null>(null);
  const [mostrarCadastrar, setMostrarCadastrar] = useState(false);

  async function carregarModalidades() {
    try {
      const dados = await apiGet<Modalidade[]>("/servicos");
      setModalidades(dados);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarModalidades();
  }, []);

  async function excluir(modalidade: Modalidade) {
    if (!confirm(`Excluir a modalidade "${modalidade.nome}"?`)) return;

    try {
      await apiDelete(`/servicos/${modalidade.id}`);
      carregarModalidades();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="pagina">
      <Header />

      <main className="modalidades-main">
        <div className="modalidades-topbar">
          <h1>Modalidades</h1>
          <button className="btn-cadastrar" onClick={() => setMostrarCadastrar(true)}>
            <Plus size={14} strokeWidth={1.5} /> Nova modalidade
          </button>
        </div>

        {carregando ? (
          <div className="modalidades-vazio">Carregando...</div>
        ) : modalidades.length === 0 ? (
          <div className="modalidades-vazio">Nenhuma modalidade cadastrada ainda.</div>
        ) : (
          <div className="modalidades-lista">
            {modalidades.map((modalidade) => (
              <div key={modalidade.id} className="modalidade-row">
                <span className="modalidade-nome">{modalidade.nome}</span>
                <span className="modalidade-valor">{formatarRecorrencia(modalidade)}</span>
                <div className="modalidade-acoes">
                  <button className="btn-icone" onClick={() => setModalidadeEditar(modalidade)} title="Editar">
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button className="btn-icone perigo" onClick={() => excluir(modalidade)} title="Excluir">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {mostrarCadastrar && (
        <ModalCadastrarModalidade
          onFechar={() => setMostrarCadastrar(false)}
          onSucesso={carregarModalidades}
        />
      )}

      {modalidadeEditar && (
        <ModalEditarModalidade
          modalidade={modalidadeEditar}
          onFechar={() => setModalidadeEditar(null)}
          onSucesso={carregarModalidades}
        />
      )}
    </div>
  );
}

export default Modalidades;
