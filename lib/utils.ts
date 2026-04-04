import dayjs from "dayjs";

/**
 * Formata um valor monetário para exibição na interface.
 * Usa o padrão brasileiro por padrão e faz fallback manual se a formatação falhar.
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

    return `R$ ${normalizedValue.toFixed(2).replace(".", ",")}`;
  }
}

/**
 * Formata uma data de renovação para exibição na interface.
 * Se a data for inválida ou não fornecida, retorna "Not provided".
 * Utiliza a biblioteca dayjs para parsing e formatação de datas.
 * O formato de saída é "MM/DD/YYYY".
 *
 * Exemplo de uso:
 * const formattedDate = formatSubscriptionDateTime("2025-04-20T10:00:00.000Z");
 * console.log(formattedDate); // Output: "04/20/2025"
 *
 * @param value - A string representando a data de renovação (ex: "2025-04-20T10:00:00.000Z").
 * @returns Uma string formatada representando a data ou "Not provided" se a data for inválida.
 *
 * Observação: Certifique-se de que a string de entrada esteja em um formato reconhecido pelo dayjs para garantir a formatação correta.
 */
export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

/**
 * Formata um status de assinatura para exibição na interface.
 * Se o valor for indefinido ou vazio, retorna "Unknown".
 * Caso contrário, capitaliza a primeira letra do status e retorna o restante em minúsculas.
 *
 * Exemplo de uso:
 * const formattedStatus = formatStatusLabel("active");
 * console.log(formattedStatus); // Output: "Active"
 *
 * @param value - A string representando o status da assinatura (ex: "active", "cancelled").
 * @returns Uma string formatada representando o status ou "Unknown" se o valor for indefinido ou vazio.
 */
export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
