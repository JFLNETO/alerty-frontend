export interface Modalidade {
  id: number;
  nome: string;
  idEmpresa: number;
  valor: number | null;
  recorrenciaValor: number | null;
  recorrenciaTipo: string | null;
}

export function formatarRecorrencia(modalidade: Modalidade): string {
  if (!modalidade.valor) return "sem valor definido";

  const valorFormatado = modalidade.valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  if (!modalidade.recorrenciaValor || !modalidade.recorrenciaTipo) {
    return valorFormatado;
  }

  const unidade = modalidade.recorrenciaValor === 1
    ? modalidade.recorrenciaTipo.replace(/s$/, "")
    : modalidade.recorrenciaTipo;

  return `${valorFormatado} a cada ${modalidade.recorrenciaValor} ${unidade}`;
}
