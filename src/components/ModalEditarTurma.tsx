import { useState } from "react";
import { apiPut } from "../services/api";
import { DIAS_SEMANA, type Turma } from "../types/Turma";
import { CalendarClock, Clock, X, Pencil } from "lucide-react";
import "../styles/Modal.css";

interface Props {
  turma: Turma;
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalEditarTurma({ turma, onFechar, onSucesso }: Props) {
  const [nome, setNome] = useState(turma.nome ?? "");
  const [diaSemana, setDiaSemana] = useState(String(turma.diaSemana));
  const [horaInicio, setHoraInicio] = useState(turma.horaInicio.slice(0, 5));
  const [horaFim, setHoraFim] = useState(turma.horaFim.slice(0, 5));
  const [ativo, setAtivo] = useState(turma.ativo);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function editar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPut(`/turmas/${turma.id}`, {
        nome: nome || null,
        diaSemana: Number(diaSemana),
        horaInicio: `${horaInicio}:00`,
        horaFim: `${horaFim}:00`,
        ativo,
      });

      onSucesso();
      onFechar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao editar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar turma</h2>
          <button className="modal-fechar" onClick={onFechar}><X size={18} strokeWidth={1.5} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-campo">
            <label>Nome (opcional)</label>
            <div className="modal-input-icon">
              <Pencil size={16} strokeWidth={1.5} />
              <input value={nome} onChange={(e) => setNome(e.target.value)} />
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

          <label className="modal-checkbox">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
            Turma ativa
          </label>

          {erro && <div className="modal-erro">{erro}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-confirmar" onClick={editar} disabled={carregando}>
            {carregando ? "Salvando..." : <><Pencil size={14} strokeWidth={1.5} /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEditarTurma;
