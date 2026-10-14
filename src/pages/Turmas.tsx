import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiDelete } from "../services/api";
import type { Turma } from "../types/Turma";
import { formatarDiaHorario } from "../types/Turma";
import Header from "../components/Header";
import ModalCadastrarTurma from "../components/ModalCadastrarTurma";
import ModalEditarTurma from "../components/ModalEditarTurma";
import { Plus, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import "../styles/Turmas.css";

interface Servico {
  id: number;
  nome: string;
}

function Turmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [turmaEditar, setTurmaEditar] = useState<Turma | null>(null);
  const [mostrarCadastrar, setMostrarCadastrar] = useState(false);

  async function carregarTurmas() {
    try {
      const [listaTurmas, listaServicos] = await Promise.all([
        apiGet<Turma[]>("/turmas"),
        apiGet<Servico[]>("/servicos"),
      ]);
      setTurmas(listaTurmas);
      setServicos(listaServicos);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTurmas();
  }, []);

  async function excluir(turma: Turma) {
    if (!confirm(`Excluir a turma "${nomeModalidade(turma.idServico)}"?`)) return;

    try {
      await apiDelete(`/turmas/${turma.id}`);
      carregarTurmas();
    } catch (e) {
      console.error(e);
    }
  }

  function nomeModalidade(idServico: number): string {
    return servicos.find((s) => s.id === idServico)?.nome ?? "Modalidade";
  }

  return (
    <div className="pagina">
      <Header />

      <main className="turmas-main">
        <div className="turmas-topbar">
          <h1>Turmas</h1>
          <button className="btn-cadastrar" onClick={() => setMostrarCadastrar(true)}>
            <Plus size={14} strokeWidth={1.5} /> Nova turma
          </button>
        </div>

        {carregando ? (
          <div className="turmas-vazio">Carregando...</div>
        ) : turmas.length === 0 ? (
          <div className="turmas-vazio">Nenhuma turma cadastrada ainda.</div>
        ) : (
          <div className="turmas-lista">
            {turmas.map((turma) => (
              <div key={turma.id} className={`turma-row ${!turma.ativo ? "inativa" : ""}`}>
                <div className="turma-info">
                  <span className="turma-nome">
                    {turma.nome || nomeModalidade(turma.idServico)}
                    {!turma.ativo && <span className="turma-badge-inativa">inativa</span>}
                  </span>
                  <span className="turma-detalhe">
                    {nomeModalidade(turma.idServico)} · {formatarDiaHorario(turma)}
                  </span>
                </div>
                <div className="turma-acoes">
                  <button
                    className="btn-icone"
                    onClick={() => navigate(`/turmas/${turma.id}/chamada`)}
                    title="Fazer chamada"
                  >
                    <ClipboardCheck size={15} strokeWidth={1.5} />
                  </button>
                  <button className="btn-icone" onClick={() => setTurmaEditar(turma)} title="Editar">
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button className="btn-icone perigo" onClick={() => excluir(turma)} title="Excluir">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {mostrarCadastrar && (
        <ModalCadastrarTurma
          onFechar={() => setMostrarCadastrar(false)}
          onSucesso={carregarTurmas}
        />
      )}

      {turmaEditar && (
        <ModalEditarTurma
          turma={turmaEditar}
          onFechar={() => setTurmaEditar(null)}
          onSucesso={carregarTurmas}
        />
      )}
    </div>
  );
}

export default Turmas;
