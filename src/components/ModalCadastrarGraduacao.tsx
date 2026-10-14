import { useState } from "react";
import { apiPost } from "../services/api";
import { Tag, Hash, CalendarClock, ClipboardCheck, X, Pencil } from "lucide-react";
import "../styles/Modal.css";

interface Props {
  idServico: number;
  proximaOrdem: number;
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalCadastrarGraduacao({ idServico, proximaOrdem, onFechar, onSucesso }: Props) {
  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState(String(proximaOrdem));
  const [requisitoDias, setRequisitoDias] = useState("0");
  const [requisitoPresencas, setRequisitoPresencas] = useState("0");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function cadastrar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPost("/graduacoes", {
        idServico,
        nome,
        ordem: Number(ordem),
        requisitoDias: Number(requisitoDias) || 0,
        requisitoPresencas: Number(requisitoPresencas) || 0,
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
          <h2>Cadastrar graduação</h2>
          <button className="modal-fechar" onClick={onFechar}><X size={18} strokeWidth={1.5} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-campo">
            <label>Nome</label>
            <div className="modal-input-icon">
              <Tag size={16} strokeWidth={1.5} />
              <input
                placeholder="Ex: Branca, Azul, Grau 1..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Ordem</label>
            <div className="modal-input-icon">
              <Hash size={16} strokeWidth={1.5} />
              <input
                type="number"
                min="1"
                value={ordem}
                onChange={(e) => setOrdem(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Tempo mínimo na graduação anterior (dias)</label>
            <div className="modal-input-icon">
              <CalendarClock size={16} strokeWidth={1.5} />
              <input
                type="number"
                min="0"
                value={requisitoDias}
                onChange={(e) => setRequisitoDias(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Presenças mínimas desde a última graduação</label>
            <div className="modal-input-icon">
              <ClipboardCheck size={16} strokeWidth={1.5} />
              <input
                type="number"
                min="0"
                value={requisitoPresencas}
                onChange={(e) => setRequisitoPresencas(e.target.value)}
              />
            </div>
          </div>

          {erro && <div className="modal-erro">{erro}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-confirmar" onClick={cadastrar} disabled={carregando || !nome}>
            {carregando ? "Cadastrando..." : <><Pencil size={14} strokeWidth={1.5} /> Cadastrar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCadastrarGraduacao;
