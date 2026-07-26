import { useState } from "react";
import { apiPost } from "../services/api";
import { Tag, DollarSign, Repeat, X, Pencil } from "lucide-react";
import "../styles/Modal.css";

interface Props {
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalCadastrarModalidade({ onFechar, onSucesso }: Props) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [recorrenciaValor, setRecorrenciaValor] = useState("1");
  const [recorrenciaTipo, setRecorrenciaTipo] = useState("meses");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function cadastrar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPost("/servicos", {
        nome,
        valor: valor ? Number(valor) : null,
        recorrenciaValor: recorrenciaValor ? Number(recorrenciaValor) : null,
        recorrenciaTipo,
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
          <h2>Cadastrar modalidade</h2>
          <button className="modal-fechar" onClick={onFechar}><X size={18} strokeWidth={1.5} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-campo">
            <label>Nome</label>
            <div className="modal-input-icon">
              <Tag size={16} strokeWidth={1.5} />
              <input
                placeholder="Ex: Jiu-Jitsu, Muay Thai..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Valor da mensalidade (R$)</label>
            <div className="modal-input-icon">
              <DollarSign size={16} strokeWidth={1.5} />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Recorrência da cobrança</label>
            <div className="modal-input-icon">
              <Repeat size={16} strokeWidth={1.5} />
              <input
                type="number"
                min="1"
                style={{ maxWidth: 70 }}
                value={recorrenciaValor}
                onChange={(e) => setRecorrenciaValor(e.target.value)}
              />
              <select
                value={recorrenciaTipo}
                onChange={(e) => setRecorrenciaTipo(e.target.value)}
              >
                <option value="dias">dia(s)</option>
                <option value="semanas">semana(s)</option>
                <option value="meses">mês(es)</option>
                <option value="anos">ano(s)</option>
              </select>
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

export default ModalCadastrarModalidade;
