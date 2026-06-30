import { useState, useEffect, useRef } from "react";
import { apiPost, apiGet } from "../services/api";
import { uploadFoto } from "../services/s3Upload";
import "../styles/Modal.css";

interface Servico {
  id: number;
  nome: string;
}

interface Props {
  onFechar: () => void;
  onSucesso: () => void;
}

function ModalCadastrar({ onFechar, onSucesso }: Props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataVencimento, setDataVencimento] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const inputFotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<Servico[]>("/servicos")
      .then(setServicos)
      .catch(console.error);
  }, []);

  function selecionarServico(servico: Servico) {
    if (!servicosSelecionados.find((s) => s.id === servico.id)) {
      setServicosSelecionados([...servicosSelecionados, servico]);
    }
    setDropdownAberto(false);
  }

  function removerServico(id: number) {
    setServicosSelecionados(servicosSelecionados.filter((s) => s.id !== id));
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoArquivo(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function cadastrar() {
    setErro("");
    setCarregando(true);
    try {
      // Primeiro cadastra o cliente sem foto para obter o ID
      const novoCliente = await apiPost<{ id: number }>("/clientes", {
        nome,
        telefone,
        dataVencimento,
        idServicos: servicosSelecionados.map((s) => s.id),
      });

      // Se tiver foto, faz upload e atualiza o cliente
      if (fotoArquivo && novoCliente.id) {
        const urlFoto = await uploadFoto(fotoArquivo, novoCliente.id.toString());
        await apiPost(`/clientes/${novoCliente.id}/foto`, { urlFoto });
      }

      onSucesso();
      onFechar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  }

  const servicosDisponiveis = servicos.filter(
    (s) => !servicosSelecionados.find((sel) => sel.id === s.id)
  );

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cadastrar cliente</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        <div className="modal-body">
          {/* FOTO */}
          <div className="modal-foto" onClick={() => inputFotoRef.current?.click()}>
            <div className="modal-foto-circulo">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" />
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
              <span>👤</span>
              <input
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </div>

          {/* TELEFONE */}
          <div className="modal-campo">
            <label>Telefone</label>
            <div className="modal-input-icon">
              <span>📞</span>
              <input
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
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
                <span>⭐</span>
                <div className="modal-tags-inline">
                  {servicosSelecionados.length === 0 ? (
                    <span className="modal-placeholder">Selecione as modalidades</span>
                  ) : (
                    servicosSelecionados.map((s) => (
                      <span key={s.id} className="modal-tag">
                        {s.nome}
                        <button onClick={(e) => { e.stopPropagation(); removerServico(s.id); }}>×</button>
                      </span>
                    ))
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

          {/* DATA DE VENCIMENTO */}
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
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-confirmar" onClick={cadastrar} disabled={carregando}>
            {carregando ? "Cadastrando..." : "✏ Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCadastrar;
