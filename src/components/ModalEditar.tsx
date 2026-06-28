import { useState } from "react";
import { apiPut } from "../services/api";
import type { Cliente } from "../types/Clientes";
import "../styles/Modal.css";

interface Props {
  cliente: Cliente;
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalEditar({ cliente, onFechar, onSucesso }: Props) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(cliente.telefone ?? "");
  const [dataVencimento, setDataVencimento] = useState(cliente.dataVencimento);
  const [idServicos, setIdServicos] = useState<number[]>(cliente.idServicos ?? []);
  const [novoServico, setNovoServico] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  function adicionarServico() {
    const id = parseInt(novoServico);
    if (!isNaN(id) && !idServicos.includes(id)) {
      setIdServicos([...idServicos, id]);
      setNovoServico("");
    }
  }

  function removerServico(id: number) {
    setIdServicos(idServicos.filter((s) => s !== id));
  }

  async function editar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPut(`/clientes/${cliente.id}`, {
        nome,
        telefone,
        dataVencimento,
        idServicos,
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
          <h2>Editar cliente</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-foto">
            <div className="modal-foto-circulo">
              {cliente.urlFoto ? (
                <img src={cliente.urlFoto} alt={cliente.nome} />
              ) : (
                <span>Alterar imagem</span>
              )}
            </div>
          </div>

          <div className="modal-campo">
            <label>Nome</label>
            <div className="modal-input-icon">
              <span>👤</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Telefone</label>
            <div className="modal-input-icon">
              <span>📞</span>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-campo">
            <label>Modalidade</label>
            <div className="modal-input-icon">
              <span>⭐</span>
              <input
                placeholder="ID da modalidade e Enter"
                value={novoServico}
                onChange={(e) => setNovoServico(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionarServico()}
              />
            </div>
            {idServicos.length > 0 && (
              <div className="modal-tags">
                {idServicos.map((id) => (
                  <span key={id} className="modal-tag">
                    {id}
                    <button onClick={() => removerServico(id)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-campo">
            <label>Data de vencimento</label>
            <div className="modal-input-icon">
              <span>📅</span>
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
          <button className="btn-cancelar" onClick={onFechar}>
            Cancelar
          </button>
          <button
            className="btn-confirmar"
            onClick={editar}
            disabled={carregando}
          >
            {carregando ? "Salvando..." : "✏ Editar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEditar;
