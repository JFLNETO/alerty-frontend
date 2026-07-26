import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../services/api";
import Header from "../components/Header";
import { QrCode, KeyRound, CircleCheck, RefreshCw, TriangleAlert } from "lucide-react";
import "../styles/ConectarWhatsApp.css";

interface StatusSessao {
  name?: string;
  status?: string;
  me?: { id?: string; pushName?: string };
}

interface QrCodeResposta {
  mimetype?: string;
  data?: string;
}

const POLL_MS = 3000;

function ConectarWhatsApp() {
  const [status, setStatus] = useState<StatusSessao | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modo, setModo] = useState<"qr" | "codigo">("qr");
  const [telefone, setTelefone] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [solicitandoCodigo, setSolicitandoCodigo] = useState(false);
  const pollingRef = useRef<number | null>(null);

  async function carregarStatus(): Promise<StatusSessao | null> {
    try {
      const dados = await apiGet<StatusSessao>("/empresa/whatsapp/status");
      setStatus(dados);
      setErro("");
      return dados;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao consultar status.");
      return null;
    } finally {
      setCarregando(false);
    }
  }

  async function carregarQr() {
    try {
      const dados = await apiGet<QrCodeResposta>("/empresa/whatsapp/qr");
      if (dados.data && dados.mimetype) {
        setQr(`data:${dados.mimetype};base64,${dados.data}`);
      }
    } catch {
      // logo após iniciar a sessão o QR pode ainda não estar pronto — o próximo poll tenta de novo
    }
  }

  function pararPolling() {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function iniciarPolling() {
    if (pollingRef.current) return;
    pollingRef.current = window.setInterval(async () => {
      const atualizado = await carregarStatus();
      if (atualizado?.status === "SCAN_QR_CODE") await carregarQr();
      if (atualizado?.status === "WORKING" || atualizado?.status === "FAILED") pararPolling();
    }, POLL_MS);
  }

  useEffect(() => {
    carregarStatus();
    return pararPolling;
  }, []);

  useEffect(() => {
    if (status?.status === "SCAN_QR_CODE") carregarQr();

    if (status?.status === "STARTING" || status?.status === "SCAN_QR_CODE") {
      iniciarPolling();
    } else {
      pararPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status]);

  async function iniciar() {
    setErro("");
    setCarregando(true);
    try {
      await apiPost("/empresa/whatsapp/iniciar", {});
      await carregarStatus();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao iniciar sessão.");
    } finally {
      setCarregando(false);
    }
  }

  async function gerarPairingCode() {
    setErro("");
    setSolicitandoCodigo(true);
    try {
      const resposta = await apiPost<{ codigo: string }>("/empresa/whatsapp/pairing-code", { telefone });
      setPairingCode(resposta.codigo);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar código.");
    } finally {
      setSolicitandoCodigo(false);
    }
  }

  const situacao = status?.status;

  return (
    <div className="pagina">
      <Header />

      <main className="conectar-main">
        <h1>Conexão do WhatsApp</h1>
        <p className="conectar-subtitulo">
          É por aqui que os alertas de vencimento são enviados — conecte o número que a academia já usa no WhatsApp.
        </p>

        <div className="conectar-card">
          {carregando && !status && <p>Carregando...</p>}

          {!carregando && (!situacao || situacao === "STOPPED" || situacao === "FAILED") && (
            <div className="conectar-estado">
              {situacao === "FAILED" && (
                <p className="conectar-erro-estado">
                  <TriangleAlert size={16} strokeWidth={1.5} /> A conexão anterior falhou. Tente novamente.
                </p>
              )}
              <p>Nenhum WhatsApp conectado ainda.</p>
              <button className="btn-confirmar" onClick={iniciar}>Conectar WhatsApp</button>
            </div>
          )}

          {situacao === "STARTING" && (
            <div className="conectar-estado">
              <RefreshCw size={20} strokeWidth={1.5} className="girando" />
              <p>Iniciando sessão...</p>
            </div>
          )}

          {situacao === "SCAN_QR_CODE" && (
            <div className="conectar-estado">
              <div className="conectar-toggle">
                <button
                  className={`conectar-toggle-btn ${modo === "qr" ? "ativo" : ""}`}
                  onClick={() => setModo("qr")}
                >
                  <QrCode size={15} strokeWidth={1.5} /> QR code
                </button>
                <button
                  className={`conectar-toggle-btn ${modo === "codigo" ? "ativo" : ""}`}
                  onClick={() => setModo("codigo")}
                >
                  <KeyRound size={15} strokeWidth={1.5} /> Código de pareamento
                </button>
              </div>

              {modo === "qr" ? (
                <>
                  {qr ? (
                    <img src={qr} alt="QR code do WhatsApp" className="conectar-qr" />
                  ) : (
                    <p>Gerando QR code...</p>
                  )}
                  <p className="conectar-instrucao">
                    No celular: WhatsApp → Aparelhos conectados → Conectar um aparelho → aponte para este QR code.
                    O código expira rápido — se sumir, aguarde o próximo aparecer sozinho.
                  </p>
                </>
              ) : (
                <div className="conectar-pairing">
                  {!pairingCode ? (
                    <>
                      <label>Número do WhatsApp (com DDI e DDD)</label>
                      <input
                        placeholder="5579999990000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                      />
                      <button
                        className="btn-confirmar"
                        onClick={gerarPairingCode}
                        disabled={solicitandoCodigo || !telefone}
                      >
                        {solicitandoCodigo ? "Gerando..." : "Gerar código"}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="conectar-codigo">{pairingCode}</p>
                      <p className="conectar-instrucao">
                        No celular: WhatsApp → Aparelhos conectados → Conectar com número de telefone →
                        digite este código.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {situacao === "WORKING" && (
            <div className="conectar-estado">
              <CircleCheck size={28} strokeWidth={1.5} className="conectar-icone-ok" />
              <p><strong>WhatsApp conectado</strong></p>
              {status?.me?.pushName && <p className="conectar-subtitulo">{status.me.pushName}</p>}
            </div>
          )}

          {erro && <div className="conectar-erro">{erro}</div>}
        </div>
      </main>
    </div>
  );
}

export default ConectarWhatsApp;
