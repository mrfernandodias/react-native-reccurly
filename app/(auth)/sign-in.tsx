import AuthScreen from "@/components/AuthScreen";
import { colors } from "@/constants/theme";
import {
  getClerkErrorMessage,
  navigateWithDecoratedUrl,
  normalizeEmailAddress,
  validateEmailAddress,
  validatePassword,
  validateVerificationCode,
} from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { usePostHog } from "posthog-react-native";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { clsx } from "clsx";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isCompletingAccess, setIsCompletingAccess] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<{
    emailAddress?: string;
    password?: string;
    code?: string;
  }>({});

  const isSubmitting = fetchStatus === "fetching";
  const isVerifyingCode = signIn?.status === "needs_client_trust";

  useEffect(() => {
    if (__DEV__) {
      console.log("[sign-in-screen]", {
        hasSignIn: Boolean(signIn),
        signInStatus: signIn?.status,
        fetchStatus,
      });
    }
  }, [fetchStatus, signIn]);

  const fieldErrors = useMemo(
    () => ({
      emailAddress:
        localErrors.emailAddress ||
        getClerkErrorMessage(errors.fields.identifier),
      password:
        localErrors.password || getClerkErrorMessage(errors.fields.password),
      code: localErrors.code || getClerkErrorMessage(errors.fields.code),
    }),
    [errors.fields.code, errors.fields.identifier, errors.fields.password, localErrors],
  );

  const clearFieldError = (field: "emailAddress" | "password" | "code") => {
    setLocalErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setGeneralError(null);
    setResendFeedback(null);
  };

  const handleFinalize = async () => {
    if (!signIn) {
      setIsCompletingAccess(false);
      setGeneralError("A autenticação ainda está carregando. Tente novamente.");
      return;
    }

    setIsCompletingAccess(true);

    try {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setIsCompletingAccess(false);
            setGeneralError(
              "Sua conta precisa concluir mais uma etapa de segurança antes de liberar o acesso.",
            );
            return;
          }

          const normalizedEmail = normalizeEmailAddress(emailAddress);
          posthog.identify(normalizedEmail, {
            $set: { email: normalizedEmail },
          });
          posthog.capture('user_signed_in', { email: normalizedEmail });

          navigateWithDecoratedUrl(decorateUrl("/home"), (href) =>
            router.replace(href),
          );
        },
      });
    } catch (error) {
      setIsCompletingAccess(false);
      throw error;
    }
  };

  const sendVerificationCode = async (showSuccessFeedback = false) => {
    if (!signIn) {
      setGeneralError("A autenticação ainda está carregando. Tente novamente.");
      return false;
    }

    setGeneralError(null);
    if (showSuccessFeedback) {
      setResendFeedback(null);
    }
    setIsResendingCode(true);

    try {
      await signIn.mfa.sendEmailCode();

      if (showSuccessFeedback) {
        setResendFeedback("Enviamos um novo código para o seu e-mail.");
      }

      return true;
    } catch (error) {
      console.error("Erro ao reenviar código de acesso:", error);
      setGeneralError(
        getClerkErrorMessage(error) ||
          "Não foi possível enviar um novo código agora. Tente novamente.",
      );
      return false;
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleResendCode = async () => {
    await sendVerificationCode(true);
  };

  const handleSubmit = async () => {
    const nextErrors = {
      emailAddress: validateEmailAddress(emailAddress),
      password: validatePassword(password),
    };

    setLocalErrors(nextErrors);

    if (nextErrors.emailAddress || nextErrors.password || !signIn) {
      if (!signIn) {
        setGeneralError("A autenticação ainda está carregando. Tente novamente.");
      }
      return;
    }

    setGeneralError(null);

    try {
      const { error } = await signIn.password({
        emailAddress: normalizeEmailAddress(emailAddress),
        password,
      });

      if (error) {
        setGeneralError(
          getClerkErrorMessage(error) ||
            "Não foi possível entrar. Confira seus dados e tente novamente.",
        );
        return;
      }

      if (signIn.status === "complete") {
        await handleFinalize();
        return;
      }

      if (signIn.status === "needs_client_trust") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          const codeWasSent = await sendVerificationCode();

          if (!codeWasSent) {
            return;
          }

          return;
        }
      }

      setGeneralError(
        "Esta conta precisa de uma etapa adicional de verificação que ainda não está disponível nesta tela.",
      );
    } catch (error) {
      setIsCompletingAccess(false);
      setGeneralError(
        getClerkErrorMessage(error) ||
          "Não foi possível entrar agora. Tente novamente.",
      );
    }
  };

  const handleVerify = async () => {
    const codeError = validateVerificationCode(code);
    setLocalErrors((currentErrors) => ({ ...currentErrors, code: codeError }));

    if (codeError || !signIn) {
      if (!signIn) {
        setGeneralError("A autenticação ainda está carregando. Tente novamente.");
      }
      return;
    }

    setGeneralError(null);

    try {
      await signIn.mfa.verifyEmailCode({ code: code.trim() });

      if (signIn.status === "complete") {
        await handleFinalize();
        return;
      }

      setGeneralError(
        "O código foi aceito, mas sua sessão ainda não está pronta. Tente novamente.",
      );
    } catch (error) {
      setIsCompletingAccess(false);
      setGeneralError(
        getClerkErrorMessage(error) ||
          "Não foi possível verificar o código. Solicite um novo e tente novamente.",
      );
    }
  };

  const handleStartOver = async () => {
    if (!signIn) {
      return;
    }

    await signIn.reset();
    setCode("");
    setGeneralError(null);
    setResendFeedback(null);
    setLocalErrors({});
  };

  if (isCompletingAccess) {
    return (
      <AuthScreen
        title="Entrando na sua conta"
        subtitle="Estamos preparando sua visão inicial."
        note="Isso leva só um instante."
      >
        <View className="auth-form">
          <View className="items-center py-8">
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        </View>
      </AuthScreen>
    );
  }

  if (isVerifyingCode) {
    return (
      <AuthScreen
        title="Confirme sua identidade"
        subtitle={`Digite o código enviado para ${normalizeEmailAddress(emailAddress)} para concluir sua entrada.`}
        note="Só pedimos esse código quando sua sessão precisa de uma validação extra."
      >
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Código de verificação</Text>
            <View
              className={clsx(
                "auth-input-shell",
                fieldErrors.code && "auth-input-shell-error",
              )}
            >
              <TextInput
                className={clsx(
                  "auth-input",
                  fieldErrors.code && "auth-input-error",
                )}
                value={code}
                onChangeText={(value) => {
                  setCode(value);
                  clearFieldError("code");
                }}
                placeholder="Código de 6 dígitos"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                underlineColorAndroid="transparent"
                selectionColor={colors.primary}
                cursorColor={colors.primary}
              />
            </View>
            {fieldErrors.code ? (
              <Text className="auth-error">{fieldErrors.code}</Text>
            ) : (
              <Text className="auth-helper">
                Confira seu e-mail e cole o código mais recente que você recebeu.
              </Text>
            )}
          </View>

          {generalError ? (
            <Text className="auth-error">{generalError}</Text>
          ) : null}

          <Pressable
            className={clsx(
              "auth-button",
              (isSubmitting || isResendingCode || !code.trim()) &&
                "auth-button-disabled",
            )}
            disabled={isSubmitting || isResendingCode || !code.trim()}
            onPress={handleVerify}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text className="auth-button-text">Verificar e continuar</Text>
            )}
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            disabled={isSubmitting || isResendingCode}
            onPress={handleResendCode}
          >
            {isResendingCode ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text className="auth-secondary-button-text">
                Enviar novo código
              </Text>
            )}
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            disabled={isSubmitting || isResendingCode}
            onPress={handleStartOver}
          >
            <Text className="auth-secondary-button-text">Começar de novo</Text>
          </Pressable>

          {resendFeedback ? (
            <Text className="auth-helper text-center">{resendFeedback}</Text>
          ) : null}
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Que bom te ver de novo"
      subtitle="Entre para continuar gerenciando suas assinaturas"
      subtitleSingleLine
      footerCopy="Novo na Recurrly?"
      footerHref="/sign-up"
      footerLinkLabel="Criar conta"
    >
      <View className="auth-form">
        <View className="auth-field">
          <Text className="auth-label">E-mail</Text>
          <View
            className={clsx(
              "auth-input-shell",
              fieldErrors.emailAddress && "auth-input-shell-error",
            )}
          >
            <TextInput
              className={clsx(
                "auth-input",
                fieldErrors.emailAddress && "auth-input-error",
              )}
              value={emailAddress}
              onChangeText={(value) => {
                setEmailAddress(value);
                clearFieldError("emailAddress");
              }}
              placeholder="Digite seu e-mail"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />
          </View>
          {fieldErrors.emailAddress ? (
            <Text className="auth-error">{fieldErrors.emailAddress}</Text>
          ) : null}
        </View>

        <View className="auth-field">
          <Text className="auth-label">Senha</Text>
          <View
            className={clsx(
              "auth-input-shell",
              fieldErrors.password && "auth-input-shell-error",
            )}
          >
            <TextInput
              className={clsx(
                "auth-input",
                fieldErrors.password && "auth-input-error",
              )}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearFieldError("password");
              }}
              placeholder="Digite sua senha"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />
          </View>
          {fieldErrors.password ? (
            <Text className="auth-error">{fieldErrors.password}</Text>
          ) : null}
        </View>

        {generalError ? <Text className="auth-error">{generalError}</Text> : null}

        <Pressable
          className={clsx(
            "auth-button",
            (isSubmitting || !emailAddress || !password) &&
              "auth-button-disabled",
          )}
          disabled={isSubmitting || !emailAddress || !password}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text className="auth-button-text">Entrar</Text>
          )}
        </Pressable>
      </View>
    </AuthScreen>
  );
}
