import { useEffect, useMemo, useRef, useState } from "react";
import { apiPost } from "../services/api";
import type { AlertaPendente, SimulacaoAlertasResponse } from "../types/AlertaPendente";
import { descreverRegra } from "../types/RegraAlerta";
import Header from "../components/Header";
import { ChevronDown, RefreshCw, Send, Check, X } from "lucide-react";
import "../styles/PainelAdmin.css";

type StatusEnvio = "enviando" | "sucesso" | "erro";

function chave(item: AlertaPendente): string {
  return `${item.idCliente}-${item.idRegraAlerta}`;
}

function formatarData(data: string): string {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function PainelAdmin() {
  const [pendentes, setPendentes] = useState<AlertaPendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<number[]>([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [statusEnvio, setStatusEnvio] = useState<Record<string, StatusEnvio>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const empresas = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const p of pendentes) {
      mapa.set(p.idEmpresa, p.empresa ?? `Empresa ${p.idEmpresa}`);
    }
    return Array.from(mapa, ([idEmpresa, nome]) => ({ idEmpresa, nome })).sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
  }, [pendentes]);

  const pendentesFiltrados = useMemo(
    () => pendentes.filter((p) => empresasSelecionadas.includes(p.idEmpresa)),
    [pendentes, empresasSelecionadas]
  );

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const dados = await apiPost<SimulacaoAlertasResponse>("/admin/alertas/simular", {});
      setPendentes(dados.pendentes);
      setEmpresasSelecionadas(Array.from(new Set(dados.pendentes.map((p) => p.idEmpresa))));
      setStatusEnvio({});
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar o relatório.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function alternarEmpresa(idEmpresa: number) {
    setEmpresasSelecionadas((atual) =>
      atual.includes(idEmpresa) ? atual.filter((id) => id !== idEmpresa) : [...atual, idEmpresa]
    );
  }

  function marcarTodas() {
    setEmpresasSelecionadas(empresas.map((e) => e.idEmpresa));
  }

  function desmarcarTodas() {
    setEmpresasSelecionadas([]);
  }

  async function enviarTeste(item: AlertaPendente) {
    const confirmado = confirm(
      `Enviar mensagem de verdade para ${item.nome} (${item.telefone}) agora?`
    );
    if (!confirmado) return;

    const id = chave(item);
    setStatusEnvio((atual) => ({ ...atual, [id]: "enviando" }));
    try {
      const resultado = await apiPost<{ sucesso: boolean; erro: string | null }>(
        "/admin/alertas/enviar-teste",
        { idCliente: item.idCliente, idRegraAlerta: item.idRegraAlerta }
      );
      setStatusEnvio((atual) => ({ ...atual, [id]: resultado.sucesso ? "sucesso" : "erro" }));
    } catch {
      setStatusEnvio((atual) => ({ ...atual, [id]: "erro" }));
    }
  }

  const labelEmpresas =
    empresasSelecionadas.length === 0
      ? "Nenhuma empresa"
      : empresasSelecionadas.length === empresas.length
      ? "Todas as empresas"
      : `${empresasSelecionadas.length} empresa(s)`;

  return (
    <div className="pagina">
      <Header />

      <main className="paineladm-main">
        <div className="paineladm-topbar">
          <h1>Alertas de hoje</h1>
          <button className="relatorio-btn" onClick={carregar} disabled={carregando}>
            <RefreshCw size={14} strokeWidth={1.5} className={carregando ? "girando" : ""} /> Atualizar
          </button>
        </div>

        <div className="paineladm-filtros">
          <div className="paineladm-multiselect" ref={dropdownRef}>
            <button
              type="button"
              className="paineladm-multiselect-btn"
              onClick={() => setDropdownAberto((a) => !a)}
            >
              {labelEmpresas}
              <ChevronDown size={16} strokeWidth={1.5} />
            </button>

            {dropdownAberto && (
              <div className="paineladm-multiselect-lista">
                <div className="paineladm-multiselect-acoes">
                  <button type="button" onClick={marcarTodas}>Marcar todas</button>
                  <button type="button" onClick={desmarcarTodas}>Desmarcar todas</button>
                </div>
                {empresas.length === 0 ? (
                  <div className="paineladm-multiselect-vazio">Nenhuma empresa no relatório.</div>
                ) : (
                  empresas.map((e) => (
                    <label key={e.idEmpresa} className="paineladm-multiselect-item">
                      <input
                        type="checkbox"
                        checked={empresasSelecionadas.includes(e.idEmpresa)}
                        onChange={() => alternarEmpresa(e.idEmpresa)}
                      />
                      {e.nome}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <span className="paineladm-total">
            {pendentesFiltrados.length} de {pendentes.length} mensagem(ns) pendente(s) hoje
          </span>
        </div>

        {erro && <div className="modal-erro" style={{ marginBottom: 16 }}>{erro}</div>}

        {carregando ? (
          <div className="relatorio-vazio">Carregando...</div>
        ) : pendentesFiltrados.length === 0 ? (
          <div className="relatorio-vazio">Nenhuma mensagem pendente para hoje.</div>
        ) : (
          <div className="relatorio-tabela-container">
            <table className="relatorio-tabela">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Regra</th>
                  <th>Vencimento</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pendentesFiltrados.map((item) => {
                  const status = statusEnvio[chave(item)];
                  return (
                    <tr key={chave(item)}>
                      <td>{item.empresa}</td>
                      <td>{item.nome}</td>
                      <td>{item.telefone}</td>
                      <td>{descreverRegra({ tipo: item.tipo, diasOffset: item.diasOffset })}</td>
                      <td>{formatarData(item.dataVencimento)}</td>
                      <td>
                        <button
                          className="paineladm-btn-teste"
                          onClick={() => enviarTeste(item)}
                          disabled={status === "enviando"}
                        >
                          {status === "sucesso" ? (
                            <><Check size={14} strokeWidth={2} /> Enviado</>
                          ) : status === "erro" ? (
                            <><X size={14} strokeWidth={2} /> Falhou</>
                          ) : status === "enviando" ? (
                            "Enviando..."
                          ) : (
                            <><Send size={14} strokeWidth={1.5} /> Enviar teste</>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default PainelAdmin;
