import { apiPost } from "./api";

interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export async function uploadFoto(arquivo: File, _clienteId: string): Promise<string> {
  const extensao = arquivo.name.split(".").pop() ?? "";

  const { uploadUrl, publicUrl } = await apiPost<UploadUrlResponse>("/uploads/foto-url", {
    extensao,
    contentType: arquivo.type,
  });

  const resposta = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": arquivo.type },
    body: arquivo,
  });

  if (!resposta.ok) throw new Error("Falha ao enviar a foto.");

  return publicUrl;
}
