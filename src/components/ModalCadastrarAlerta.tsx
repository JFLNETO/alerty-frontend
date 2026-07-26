import { useState } from "react";
import { apiPost } from "../services/api";
import { TIPO_ANTES, TIPO_NO_DIA, TIPO_APOS } from "../types/RegraAlerta";
import type { TipoAlerta } from "../types/RegraAlerta";
import { Bell, CalendarClock, MessageSquare, X, Pencil } from "lucide-react";
import "../styles/Modal.css";

interface Props {
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalCadastrarAlerta({ onFechar, onSucesso }: Props) {
  const [tipo, setTipo] = useState<TipoAlerta>(TIPO_ANTES);
  const [diasOffset, setDiasOffset] = useState("3");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function cadastrar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPost("/alertas", {
        tipo,
        diasOffset: tipo === TIPO_NO_DIA ? 0 : Number(diasOffset),
        mensagem,
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
          <h2>Novo alerta</h2>
          <button className="modal-fechar" onClick={onFechar}><X size={18} strokeWidth={1.5} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-campo">
            <label>Quando disparar</label>
            <div className="modal-input-icon">
              <Bell size={16} strokeWidth={1.5} />
              <select value={tipo} onChange={(e) => setTipo(Number(e.target.value) as TipoAlerta)}>
                <option value={TIPO_ANTES}>Antes do vencimento</option>
                <option value={TIPO_NO_DIA}>No dia do vencimento</option>
                <option value={TIPO_APOS}>Após o vencimento (atraso)</option>
              </select>
            </div>
          </div>

          {tipo !== TIPO_NO_DIA && (
            <div className="modal-campo">
              <label>{tipo === TIPO_ANTES ? "Dias antes do vencimento" : "Dias de atraso"}</label>
              <div className="modal-input-icon">
                <CalendarClock size={16} strokeWidth={1.5} />
                <input
                  type="number"
                  min="1"
                  value={diasOffset}
                  onChange={(e) => setDiasOffset(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="modal-campo">
            <label>Mensagem</label>
            <div className="modal-input-icon" style={{ alignItems: "flex-start" }}>
              <MessageSquare size={16} strokeWidth={1.5} style={{ marginTop: 10 }} />
              <textarea
                rows={4}
                placeholder="Use {nome} para inserir o nome do aluno. Ex: Olá {nome}, sua mensalidade vence em breve!"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                style={{ border: "none", outline: "none", flex: 1, fontSize: 15, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {erro && <div className="modal-erro">{erro}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-confirmar" onClick={cadastrar} disabled={carregando || !mensagem}>
            {carregando ? "Cadastrando..." : <><Pencil size={14} strokeWidth={1.5} /> Cadastrar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCadastrarAlerta;
