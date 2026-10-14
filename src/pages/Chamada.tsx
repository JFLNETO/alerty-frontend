import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../services/api";
import type { Turma } from "../types/Turma";
import { formatarDiaHorario } from "../types/Turma";
import { STATUS_PRESENTE, STATUS_AUSENTE, type AlunoChamada, type StatusPresenca } from "../types/Presenca";
import Header from "../components/Header";
import { ArrowLeft, Check, X as XIcon, Star } from "lucide-react";
import "../styles/Chamada.css";

interface Servico {
  id: number;
  nome: string;
}

function hojeISO(): string {
  const hoje = new Date();
  const offset = hoje.getTimezoneOffset();
  const local = new Date(hoje.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

function Chamada() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [data, setData] = useState(hojeISO());
  const [alunos, setAlunos] = useState<AlunoChamada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([apiGet<Turma[]>("/turmas"), apiGet<Servico[]>("/servicos")])
      .then(([turmas, listaServicos]) => {
        setTurma(turmas.find((t) => t.id === Number(id)) ?? null);
        setServicos(listaServicos);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : "Erro ao carregar turma."));
  }, [id]);

  const carregarChamada = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    setErro("");
    try {
      const lista = await apiGet<AlunoChamada[]>(`/turmas/${id}/chamada?data=${data}`);
      setAlunos(lista);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar chamada.");
    } finally {
      setCarregando(false);
    }
  }, [id, data]);

  useEffect(() => {
    carregarChamada();
  }, [carregarChamada]);

  async function marcarStatus(idCliente: number, status: StatusPresenca) {
    if (!id) return;
    setSalvandoId(idCliente);
    setErro("");
    try {
      await apiPost(`/turmas/${id}/chamada`, {
        data,
        itens: [{ idCliente, status }],
      });
      setAlunos((atual) =>
        atual.map((a) => (a.idCliente === idCliente ? { ...a, status } : a))
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao lançar presença.");
    } finally {
      setSalvandoId(null);
    }
  }

  const nomeModalidade = turma ? servicos.find((s) => s.id === turma.idServico)?.nome : "";

  return (
    <div className="pagina">
      <Header />

      <main className="chamada-main">
        <button className="chamada-voltar" onClick={() => navigate("/turmas")}>
          <ArrowLeft size={16} strokeWidth={1.5} /> Voltar para turmas
        </button>

        <div className="chamada-topbar">
          <div>
            <h1>{turma?.nome || nomeModalidade || "Chamada"}</h1>
            {turma && (
              <span className="chamada-subtitulo">
                {nomeModalidade} · {formatarDiaHorario(turma)}
              </span>
            )}
          </div>
          <div className="chamada-data">
            <label>Data da aula</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>

        {erro && <div className="chamada-erro">{erro}</div>}

        {carregando ? (
          <div className="chamada-vazio">Carregando...</div>
        ) : alunos.length === 0 ? (
          <div className="chamada-vazio">Nenhum aluno ativo nessa modalidade ainda.</div>
        ) : (
          <div className="chamada-lista">
            {alunos.map((aluno) => (
              <div key={aluno.idCliente} className="chamada-row">
                <div className="chamada-aluno-info">
                  <span className="chamada-aluno-nome">{aluno.nome}</span>
                  {aluno.matriculadoNestaTurma && (
                    <span className="chamada-badge-matriculado">
                      <Star size={11} strokeWidth={1.5} /> matriculado nesta turma
                    </span>
                  )}
                </div>
                <div className="chamada-status-botoes">
                  <button
                    className={`chamada-btn-status presente ${aluno.status === STATUS_PRESENTE ? "ativo" : ""}`}
                    disabled={salvandoId === aluno.idCliente}
                    onClick={() => marcarStatus(aluno.idCliente, STATUS_PRESENTE)}
                  >
                    <Check size={14} strokeWidth={1.5} /> Presente
                  </button>
                  <button
                    className={`chamada-btn-status ausente ${aluno.status === STATUS_AUSENTE ? "ativo" : ""}`}
                    disabled={salvandoId === aluno.idCliente}
                    onClick={() => marcarStatus(aluno.idCliente, STATUS_AUSENTE)}
                  >
                    <XIcon size={14} strokeWidth={1.5} /> Ausente
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Chamada;
