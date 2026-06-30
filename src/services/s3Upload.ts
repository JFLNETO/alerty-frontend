import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = import.meta.env.VITE_AWS_BUCKET_NAME;

export async function uploadFoto(arquivo: File, clienteId: string): Promise<string> {
  // Gera um nome único para evitar sobrescrever fotos
  const extensao = arquivo.name.split(".").pop();
  const nomeArquivo = `clientes/${clienteId}-${Date.now()}.${extensao}`;

  const comando = new PutObjectCommand({
    Bucket: BUCKET,
    Key: nomeArquivo,
    Body: await arquivo.arrayBuffer(),
    ContentType: arquivo.type,
  });

  await s3.send(comando);

  // Retorna a URL pública da foto
  return `https://${BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${nomeArquivo}`;
}
