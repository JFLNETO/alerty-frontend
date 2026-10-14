import { useState, useEffect, useRef } from "react";
import { apiPut, apiGet } from "../services/api";
import { uploadFoto } from "../services/s3Upload";
import { apenasDigitos, formatarTelefone, type Cliente } from "../types/Clientes";
import { formatarDiaHorario, type Turma } from "../types/Turma";
import type { Graduacao, GraduacaoStatus } from "../types/Graduacao";
import { User, Phone, Star, CalendarDays, CalendarClock, X, Pencil } from "lucide-react";
import "../styles/Modal.css";

interface Servico {
  id: number;
  nome: string;
}

interface Props {
  cliente: Cliente;
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalEditar({ cliente, onFechar, onSucesso }: Props) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(apenasDigitos(cliente.telefone ?? ""));
  const [dataVencimento, setDataVencimento] = useState(cliente.dataVencimento);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<Turma[]>([]);
  const [dropdownTurmaAberto, setDropdownTurmaAberto] = useState(false);
  const [graduacoesPorServico, setGraduacoesPorServico] = useState<Record<number, Graduacao[]>>({});
  const [graduacaoAtualPorServico, setGraduacaoAtualPorServico] = useState<Record<number, number>>({});
  const [salvandoGraduacaoServico, setSalvandoGraduacaoServico] = useState<number | null>(null);
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(cliente.urlFoto);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const inputFotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<Servico[]>("/servicos").then((lista) => {
      setServicos(lista);
      const preSelected = lista.filter((s) => cliente.idServicos?.includes(s.id));
      setServicosSelecionados(preSelected);
      preSelected.forEach((s) => carregarGraduacoesDoServico(s.id));
    }).catch(console.error);
    apiGet<Turma[]>("/turmas").then((lista) => {
      setTurmas(lista);
      const preSelected = lista.filter((t) => cliente.idTurmas?.includes(t.id));
      setTurmasSelecionadas(preSelected);
    }).catch(console.error);
    apiGet<GraduacaoStatus[]>(`/clientes/${cliente.id}/graduacoes`).then((lista) => {
      const mapa: Record<number, number> = {};
      lista.forEach((g) => { mapa[g.idServico] = g.idGraduacaoAtual; });
      setGraduacaoAtualPorServico(mapa);
    }).catch(console.error);
  }, []);

  function carregarGraduacoesDoServico(idServico: number) {
    if (graduacoesPorServico[idServico]) return;
    apiGet<Graduacao[]>(`/servicos/${idServico}/graduacoes`)
      .then((lista) => setGraduacoesPorServico((atual) => ({ ...atual, [idServico]: lista })))
      .catch(console.error);
  }

  async function alterarGraduacao(idServico: number, idGraduacao: number) {
    setSalvandoGraduacaoServico(idServico);
    setErro("");
    try {
      await apiPut(`/clientes/${cliente.id}/graduacoes/${idServico}`, { idGraduacao });
      setGraduacaoAtualPorServico((atual) => ({ ...atual, [idServico]: idGraduacao }));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar graduação.");
    } finally {
      setSalvandoGraduacaoServico(null);
    }
  }

  function selecionarServico(servico: Servico) {
    if (!servicosSelecionados.find((s) => s.id === servico.id)) {
      setServicosSelecionados([...servicosSelecionados, servico]);
      carregarGraduacoesDoServico(servico.id);
    }
    setDropdownAberto(false);
  }

  function removerServico(id: number) {
    setServicosSelecionados(servicosSelecionados.filter((s) => s.id !== id));
    setTurmasSelecionadas(turmasSelecionadas.filter((t) => t.idServico !== id));
  }

  function selecionarTurma(turma: Turma) {
    if (!turmasSelecionadas.find((t) => t.id === turma.id)) {
      setTurmasSelecionadas([...turmasSelecionadas, turma]);
    }
    setDropdownTurmaAberto(false);
  }

  function removerTurma(id: number) {
    setTurmasSelecionadas(turmasSelecionadas.filter((t) => t.id !== id));
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoArquivo(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function editar() {
    setErro("");
    setCarregando(true);
    try {
      let urlFoto = cliente.urlFoto;

      // Se selecionou nova foto, faz upload primeiro
      if (fotoArquivo) {
        urlFoto = await uploadFoto(fotoArquivo, cliente.id.toString());
      }

      await apiPut(`/clientes/${cliente.id}`, {
        nome,
        telefone,
        dataVencimento,
        idServicos: servicosSelecionados.map((s) => s.id),
        idTurmas: turmasSelecionadas.map((t) => t.id),
        urlFoto,
      });

      onSucesso();
      onFechar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao editar.");
    } finally {
      setCarregando(false);
    }
  }

  const servicosDisponiveis = servicos.filter(
    (s) => !servicosSelecionados.find((sel) => sel.id === s.id)
  );

  const idsServicosSelecionados = servicosSelecionados.map((s) => s.id);
  const turmasDisponiveis = turmas.filter(
    (t) => idsServicosSelecionados.includes(t.idServico) && !turmasSelecionadas.find((sel) => sel.id === t.id)
  );

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar cliente</h2>
          <button className="modal-fechar" onClick={onFechar}><X size={18} strokeWidth={1.5} /></button>
        </div>

        <div className="modal-body">
          {/* FOTO */}
          <div className="modal-foto" onClick={() => inputFotoRef.current?.click()}>
            <div className="modal-foto-circulo">
              {fotoPreview ? (
                <img src={fotoPreview} alt={cliente.nome} />
              ) : (
                <span>Alterar imagem</span>
              )}
            </div>
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFoto}
            />
          </div>

          {/* NOME */}
          <div className="modal-campo">
            <label>Nome</label>
            <div className="modal-input-icon">
              <User size={16} strokeWidth={1.5} />
              <input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
          </div>

          {/* TELEFONE */}
          <div className="modal-campo">
            <label>Telefone</label>
            <div className="modal-input-icon">
              <Phone size={16} strokeWidth={1.5} />
              <input
                placeholder="(79) 91234-5678"
                value={formatarTelefone(telefone)}
                onChange={(e) => setTelefone(apenasDigitos(e.target.value))}
              />
            </div>
          </div>

          {/* MODALIDADE */}
          <div className="modal-campo">
            <label>Modalidade</label>
            <div className="modal-dropdown-container">
              <div
                className="modal-dropdown-trigger"
                onClick={() => setDropdownAberto(!dropdownAberto)}
              >
                <Star size={16} strokeWidth={1.5} />
                <div className="modal-tags-inline">
                  {servicosSelecionados.length === 0 ? (
                    <span className="modal-placeholder">Selecione as modalidades</span>
                  ) : (
                    servicosSelecionados.map((s) => {
                      const graduacoes = graduacoesPorServico[s.id] ?? [];
                      const idGraduacaoAtual = graduacaoAtualPorServico[s.id] ?? graduacoes[0]?.id;
                      return (
                        <span key={s.id} className="modal-tag-grupo">
                          <span className="modal-tag">
                            {s.nome}
                            <button onClick={(e) => { e.stopPropagation(); removerServico(s.id); }}>×</button>
                          </span>
                          {graduacoes.length > 0 && (
                            <select
                              className="modal-tag-graduacao"
                              value={idGraduacaoAtual ?? ""}
                              disabled={salvandoGraduacaoServico === s.id}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => alterarGraduacao(s.id, Number(e.target.value))}
                            >
                              {graduacoes.map((g) => (
                                <option key={g.id} value={g.id}>{g.nome}</option>
                              ))}
                            </select>
                          )}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
              {dropdownAberto && servicosDisponiveis.length > 0 && (
                <div className="modal-dropdown-lista">
                  {servicosDisponiveis.map((s) => (
                    <div key={s.id} className="modal-dropdown-item" onClick={() => selecionarServico(s)}>
                      {s.nome}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TURMA DE REFERÊNCIA */}
          {servicosSelecionados.length > 0 && (
            <div className="modal-campo">
              <label>Turma de referência (opcional)</label>
              <div className="modal-dropdown-container">
                <div
                  className="modal-dropdown-trigger"
                  onClick={() => setDropdownTurmaAberto(!dropdownTurmaAberto)}
                >
                  <CalendarClock size={16} strokeWidth={1.5} />
                  <div className="modal-tags-inline">
                    {turmasSelecionadas.length === 0 ? (
                      <span className="modal-placeholder">Aluno frequenta qualquer turma da modalidade</span>
                    ) : (
                      turmasSelecionadas.map((t) => (
                        <span key={t.id} className="modal-tag">
                          {t.nome || formatarDiaHorario(t)}
                          <button onClick={(e) => { e.stopPropagation(); removerTurma(t.id); }}>×</button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {dropdownTurmaAberto && turmasDisponiveis.length > 0 && (
                  <div className="modal-dropdown-lista">
                    {turmasDisponiveis.map((t) => (
                      <div key={t.id} className="modal-dropdown-item" onClick={() => selecionarTurma(t)}>
                        {t.nome || formatarDiaHorario(t)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DATA DE VENCIMENTO */}
          <div className="modal-campo">
            <label>Data de vencimento</label>
            <div className="modal-input-icon">
              <CalendarDays size={16} strokeWidth={1.5} />
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </div>
          </div>

          {erro && <div className="modal-erro">{erro}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-confirmar" onClick={editar} disabled={carregando}>
            {carregando ? "Salvando..." : <><Pencil size={14} strokeWidth={1.5} /> Editar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEditar;
