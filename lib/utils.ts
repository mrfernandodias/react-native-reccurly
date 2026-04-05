import dayjs from "dayjs";

/**
 * Formats a numeric amount for display using Brazilian currency rules by default and falls back to a simple prefixed format if locale formatting fails.
 *
 * @param value - The numeric amount to format
 * @param currency - ISO 4217 currency code; defaults to `"BRL"`. If fallback occurs, `"BRL"` maps to `"R$ "`, `"USD"` maps to `"$ "`, otherwise the provided code is used as a prefix.
 * @returns The formatted currency string
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
      currency === "BRL" ? "R$ " : currency === "USD" ? "$ " : currency + " ";
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
  const firstChar = value.charAt(0).toUpperCase();
  const rest = value.slice(1).toLowerCase();
  return firstChar + rest;
};
