import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiDelete, apiPost } from "../services/api";
import type { Graduacao } from "../types/Graduacao";
import Header from "../components/Header";
import ModalCadastrarGraduacao from "../components/ModalCadastrarGraduacao";
import ModalEditarGraduacao from "../components/ModalEditarGraduacao";
import { ArrowLeft, Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import "../styles/GraduacoesCadastro.css";

interface Servico {
  id: number;
  nome: string;
}

function GraduacoesCadastro() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idServico = Number(id);

  const [servico, setServico] = useState<Servico | null>(null);
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [graduacaoEditar, setGraduacaoEditar] = useState<Graduacao | null>(null);
  const [mostrarCadastrar, setMostrarCadastrar] = useState(false);
  const [aplicandoModelo, setAplicandoModelo] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [listaServicos, listaGraduacoes] = await Promise.all([
        apiGet<Servico[]>("/servicos"),
        apiGet<Graduacao[]>(`/servicos/${idServico}/graduacoes`),
      ]);
      setServico(listaServicos.find((s) => s.id === idServico) ?? null);
      setGraduacoes(listaGraduacoes);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar graduações.");
    } finally {
      setCarregando(false);
    }
  }, [idServico]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(graduacao: Graduacao) {
    if (!confirm(`Excluir a graduação "${graduacao.nome}"?`)) return;

    try {
      await apiDelete(`/graduacoes/${graduacao.id}`);
      carregar();
    } catch (e) {
      console.error(e);
    }
  }

  async function usarModeloPadrao() {
    setAplicandoModelo(true);
    setErro("");
    try {
      await apiPost(`/graduacoes/modelo-padrao?idServico=${idServico}`, {});
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao aplicar modelo padrão.");
    } finally {
      setAplicandoModelo(false);
    }
  }

  const proximaOrdem = graduacoes.length === 0
    ? 1
    : Math.max(...graduacoes.map((g) => g.ordem)) + 1;

  return (
    <div className="pagina">
      <Header />

      <main className="graduacoes-cadastro-main">
        <button className="graduacoes-cadastro-voltar" onClick={() => navigate("/modalidades")}>
          <ArrowLeft size={16} strokeWidth={1.5} /> Voltar para modalidades
        </button>

        <div className="graduacoes-cadastro-topbar">
          <h1>Graduações {servico ? `— ${servico.nome}` : ""}</h1>
          <button className="btn-cadastrar" onClick={() => setMostrarCadastrar(true)}>
            <Plus size={14} strokeWidth={1.5} /> Nova graduação
          </button>
        </div>

        {erro && <div className="graduacoes-cadastro-erro">{erro}</div>}

        {carregando ? (
          <div className="graduacoes-cadastro-vazio">Carregando...</div>
        ) : graduacoes.length === 0 ? (
          <div className="graduacoes-cadastro-vazio">
            <p>Nenhuma graduação cadastrada ainda nessa modalidade.</p>
            <button
              className="graduacoes-cadastro-btn-modelo"
              onClick={usarModeloPadrao}
              disabled={aplicandoModelo}
            >
              <Sparkles size={14} strokeWidth={1.5} />
              {aplicandoModelo ? "Aplicando..." : "Usar modelo padrão (Jiu-Jitsu adulto)"}
            </button>
          </div>
        ) : (
          <div className="graduacoes-cadastro-lista">
            {graduacoes.map((g) => (
              <div key={g.id} className="graduacao-cadastro-row">
                <div className="graduacao-cadastro-info">
                  <span className="graduacao-cadastro-nome">{g.ordem}º — {g.nome}</span>
                  <span className="graduacao-cadastro-detalhe">
                    {g.requisitoDias > 0 ? `${g.requisitoDias} dias mínimos` : "sem tempo mínimo"}
                    {" · "}
                    {g.requisitoPresencas > 0 ? `${g.requisitoPresencas} presenças mínimas` : "sem frequência mínima"}
                  </span>
                </div>
                <div className="graduacao-cadastro-acoes">
                  <button className="btn-icone" onClick={() => setGraduacaoEditar(g)} title="Editar">
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button className="btn-icone perigo" onClick={() => excluir(g)} title="Excluir">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {mostrarCadastrar && (
        <ModalCadastrarGraduacao
          idServico={idServico}
          proximaOrdem={proximaOrdem}
          onFechar={() => setMostrarCadastrar(false)}
          onSucesso={carregar}
        />
      )}

      {graduacaoEditar && (
        <ModalEditarGraduacao
          graduacao={graduacaoEditar}
          onFechar={() => setGraduacaoEditar(null)}
          onSucesso={carregar}
        />
      )}
    </div>
  );
}

export default GraduacoesCadastro;
