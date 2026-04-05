import type { Href } from "expo-router";

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

export interface AuthValidationErrors {
  emailAddress?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
}

export function normalizeEmailAddress(value: string) {
  return value.trim().toLowerCase();
}

export function validateEmailAddress(value: string) {
  const normalizedValue = normalizeEmailAddress(value);

  if (!normalizedValue) {
    return "Informe seu e-mail.";
  }

  if (!EMAIL_ADDRESS_PATTERN.test(normalizedValue)) {
    return "Use um e-mail válido.";
  }

  return undefined;
}

export function validatePassword(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "Informe sua senha.";
  }

  if (value !== normalizedValue) {
    return "Não use espaços no início ou no fim da senha.";
  }

  if (normalizedValue.length < 8) {
    return "Use pelo menos 8 caracteres.";
  }

  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
) {
  if (!confirmation.trim()) {
    return "Confirme sua senha.";
  }

  if (password !== confirmation) {
    return "As senhas não coincidem.";
  }

  return undefined;
}

export function validateVerificationCode(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "Informe o código de 6 dígitos.";
  }

  if (!VERIFICATION_CODE_PATTERN.test(normalizedValue)) {
    return "Use o código de 6 dígitos enviado por e-mail.";
  }

  return undefined;
}

function translateClerkMessage(message?: string) {
  if (!message) {
    return undefined;
  }

  const translations: [RegExp, string][] = [
    [/enter your email/i, "Informe seu e-mail."],
    [/valid email/i, "Use um e-mail válido."],
    [/enter your password/i, "Informe sua senha."],
    [/(at least|minimum).*(8).*(characters|char)/i, "Use pelo menos 8 caracteres."],
    [/passwords? do not match/i, "As senhas não coincidem."],
    [/(already in use|already taken|already exists)/i, "Esse e-mail já está em uso. Tente outro."],
    [/(verification|email).*(code).*(invalid|incorrect)/i, "O código informado é inválido."],
    [/(verification|email).*(code).*(expired)/i, "O código expirou. Solicite um novo."],
    [/(too common|data breach|compromised)/i, "Escolha uma senha mais segura."],
    [/password is too short/i, "Use pelo menos 8 caracteres."],
  ];

  for (const [pattern, translatedMessage] of translations) {
    if (pattern.test(message)) {
      return translatedMessage;
    }
  }

  return message;
}

export function getClerkErrorMessage(error: unknown) {
  if (!error) {
    return undefined;
  }

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    return getClerkErrorMessage(error[0]);
  }

  if (typeof error === "object") {
    const candidate = error as {
      message?: string;
      longMessage?: string;
      errors?: { message?: string; longMessage?: string }[];
    };

    if (candidate.longMessage) {
      return translateClerkMessage(candidate.longMessage);
    }

    if (candidate.message) {
      return translateClerkMessage(candidate.message);
    }

    if (candidate.errors?.length) {
      return getClerkErrorMessage(candidate.errors[0]);
    }
  }

  return undefined;
}

export function navigateWithDecoratedUrl(
  url: string,
  onNativeNavigate: (href: Href) => void,
) {
  if (url.startsWith("http") && typeof window !== "undefined") {
    window.location.href = url;
    return;
  }

  onNativeNavigate(url as Href);
}
