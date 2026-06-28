import { useState } from "react";
import { apiPost } from "../services/api";
import type { Cliente } from "../types/Clientes";
import "../styles/Modal.css";

interface Props {
  cliente: Cliente;
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalPagamento({ cliente, onFechar, onSucesso }: Props) {
  const [valor, setValor] = useState("100");
  const [novoVencimento, setNovoVencimento] = useState(() => {
    // Sugere o próximo mês automaticamente
    const d = new Date(cliente.dataVencimento + "T00:00:00");
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const proximaData = new Date(novoVencimento + "T00:00:00");
  const diaFormatado = proximaData.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  async function confirmar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPost("/pagamentos/confirmar", {
        clienteId: cliente.id,
        valor: parseFloat(valor),
        novoVencimento,
      });
      onSucesso();
      onFechar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao confirmar pagamento.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirmar pagamento</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        <div className="modal-body">
          <p>
            Confirmar o pagamento do Aluno{" "}
            <strong>{cliente.nome}</strong>.
          </p>

          <div className="modal-campo">
            <label>Valor (R$)</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>

          <div className="modal-campo">
            <label>Próximo vencimento</label>
            <input
              type="date"
              value={novoVencimento}
              onChange={(e) => setNovoVencimento(e.target.value)}
            />
          </div>

          <p>
            Após confirmar o pagamento a próxima data de pagamento será{" "}
            <strong>{diaFormatado}</strong>.
          </p>

          <p>Confirma?</p>

          {erro && <div className="modal-erro">{erro}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onFechar}>
            Cancelar
          </button>
          <button
            className="btn-confirmar"
            onClick={confirmar}
            disabled={carregando}
          >
            {carregando ? "Confirmando..." : "✓ Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPagamento;
