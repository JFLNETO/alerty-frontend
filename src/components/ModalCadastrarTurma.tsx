import { useState, useEffect } from "react";
import { apiPost, apiGet } from "../services/api";
import { DIAS_SEMANA } from "../types/Turma";
import { Tag, CalendarClock, Clock, X, Pencil } from "lucide-react";
import "../styles/Modal.css";

interface Servico {
  id: number;
  nome: string;
}

interface Props {
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalCadastrarTurma({ onFechar, onSucesso }: Props) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [idServico, setIdServico] = useState("");
  const [nome, setNome] = useState("");
  const [diaSemana, setDiaSemana] = useState("2");
  const [horaInicio, setHoraInicio] = useState("19:00");
  const [horaFim, setHoraFim] = useState("20:00");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiGet<Servico[]>("/servicos")
      .then((lista) => {
        setServicos(lista);
        if (lista.length > 0) setIdServico(String(lista[0].id));
      })
      .catch(console.error);
  }, []);

  async function cadastrar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPost("/turmas", {
        idServico: idServico ? Number(idServico) : null,
        nome: nome || null,
        diaSemana: Number(diaSemana),
        horaInicio: `${horaInicio}:00`,
        horaFim: `${horaFim}:00`,
      });

      onSucesso();
      onFechar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cadastrar turma</h2>
          <button className="modal-fechar" onClick={onFechar}><X size={18} strokeWidth={1.5} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-campo">
            <label>Modalidade</label>
            <div className="modal-input-icon">
              <Tag size={16} strokeWidth={1.5} />
              <select value={idServico} onChange={(e) => setIdServico(e.target.value)}>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-campo">
            <label>Nome (opcional)</label>
            <div className="modal-input-icon">
              <Pencil size={16} strokeWidth={1.5} />
              <input
                placeholder="Ex: Jiu-Jitsu Ter/Qui 19h"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Dia da semana</label>
            <div className="modal-input-icon">
              <CalendarClock size={16} strokeWidth={1.5} />
              <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)}>
                {DIAS_SEMANA.map((dia, i) => (
                  <option key={i} value={i}>{dia}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-campo">
            <label>Horário</label>
            <div className="modal-input-icon">
              <Clock size={16} strokeWidth={1.5} />
              <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
              <span>até</span>
              <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
          </div>

          {erro && <div className="modal-erro">{erro}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-confirmar" onClick={cadastrar} disabled={carregando || !idServico}>
            {carregando ? "Cadastrando..." : <><Pencil size={14} strokeWidth={1.5} /> Cadastrar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCadastrarTurma;
