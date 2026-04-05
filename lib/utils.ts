import dayjs from "dayjs";

/**
 * Formata um valor numérico seguindo o padrão monetário brasileiro por padrão.
 * Se a formatação por locale falhar, aplica um fallback simples com prefixo.
 *
 * @param value O valor numérico a ser formatado.
 * @param currency Código ISO 4217 da moeda. O padrão é `"BRL"`.
 * @returns O valor formatado para exibição na interface.
 */
export function formatCurrency(value: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const normalizedValue = Number.isFinite(value) ? value : 0;
    const currencySymbol =
      currency === "BRL"
        ? "R$ "
        : currency === "USD"
          ? "US$ "
          : currency + " ";
    return `${currencySymbol}${normalizedValue.toFixed(2).replace(".", ",")}`;
  }
}

/**
 * Formata uma data de renovação para exibição na interface.
 * Se a data for inválida ou não fornecida, retorna "Não informado".
 * Utiliza a biblioteca dayjs para parsing e formatação de datas.
 * O formato de saída é "DD/MM/YYYY".
 *
 * Exemplo de uso:
 * const formattedDate = formatSubscriptionDateTime("2025-04-20T10:00:00.000Z");
 * console.log(formattedDate); // Saída: "20/04/2025"
 *
 * @param value - A string representando a data de renovação (ex: "2025-04-20T10:00:00.000Z").
 * @returns Uma string formatada representando a data ou "Não informado" se a data for inválida.
 *
 * Observação: Certifique-se de que a string de entrada esteja em um formato reconhecido pelo dayjs para garantir a formatação correta.
 */
export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Não informado";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("DD/MM/YYYY")
    : "Não informado";
};

/**
 * Formata um status de assinatura para exibição na interface.
 * Se o valor for indefinido ou vazio, retorna "Não informado".
 * Também converte valores comuns em inglês para rótulos em pt-BR.
 *
 * Exemplo de uso:
 * const formattedStatus = formatStatusLabel("ativa");
 * console.log(formattedStatus); // Saída: "Ativa"
 *
 * @param value A string representando o status da assinatura.
 * @returns Uma string formatada representando o status ou "Não informado".
 */
export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Não informado";

  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const statusLabels: Record<string, string> = {
    active: "Ativa",
    ativa: "Ativa",
    paused: "Pausada",
    pausada: "Pausada",
    cancelled: "Cancelada",
    canceled: "Cancelada",
    cancelada: "Cancelada",
    expired: "Expirada",
    expirada: "Expirada",
    pending: "Pendente",
    pendente: "Pendente",
    past_due: "Em atraso",
    em_atraso: "Em atraso",
    trialing: "Em teste",
    em_teste: "Em teste",
  };

  if (statusLabels[normalizedValue]) {
    return statusLabels[normalizedValue];
  }

  return normalizedValue
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
