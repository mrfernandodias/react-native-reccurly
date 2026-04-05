import AuthScreen from "@/components/AuthScreen";
import { colors } from "@/constants/theme";
import {
  getClerkErrorMessage,
  navigateWithDecoratedUrl,
  normalizeEmailAddress,
  validateEmailAddress,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { clsx } from "clsx";
import { Redirect, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isCompletingAccess, setIsCompletingAccess] = useState(false);
  const [hasSentVerificationCode, setHasSentVerificationCode] = useState(false);
  const [isSendingVerificationCode, setIsSendingVerificationCode] =
    useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<
    string | null
  >(null);
  const [localErrors, setLocalErrors] = useState<{
    emailAddress?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
  }>({});

  const isSubmitting = fetchStatus === "fetching";
  const isVerifyingEmail =
    hasSentVerificationCode &&
    signUp?.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  useEffect(() => {
    if (__DEV__) {
      console.log("[sign-up-screen]", {
        hasSignUp: Boolean(signUp),
        signUpStatus: signUp?.status,
        fetchStatus,
        isSignedIn,
      });
    }
  }, [fetchStatus, isSignedIn, signUp]);

  const fieldErrors = useMemo(
    () => ({
      emailAddress:
        localErrors.emailAddress ||
        getClerkErrorMessage(errors.fields.emailAddress),
      password:
        localErrors.password || getClerkErrorMessage(errors.fields.password),
      confirmPassword: localErrors.confirmPassword,
      code: localErrors.code || getClerkErrorMessage(errors.fields.code),
    }),
    [
      errors.fields.code,
      errors.fields.emailAddress,
      errors.fields.password,
      localErrors,
    ],
  );

  const clearFieldError = (
    field: "emailAddress" | "password" | "confirmPassword" | "code",
  ) => {
    setLocalErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setGeneralError(null);
    setVerificationFeedback(null);
  };

  const handleFinalize = async () => {
    if (!signUp) {
      setIsCompletingAccess(false);
      setGeneralError("A autenticação ainda está carregando. Tente novamente.");
      return;
    }

    setIsCompletingAccess(true);

    try {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setIsCompletingAccess(false);
            setGeneralError(
              "Sua conta foi criada, mas ainda falta uma etapa de segurança.",
            );
            return;
          }

          const normalizedEmail = normalizeEmailAddress(emailAddress);
          posthog.identify(normalizedEmail, {
            $set: { email: normalizedEmail },
            $set_once: { first_sign_up_date: new Date().toISOString() },
          });
          posthog.capture("user_signed_up", { email: normalizedEmail });

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
    if (!signUp) {
      setGeneralError("A autenticação ainda está carregando. Tente novamente.");
      return false;
    }

    setGeneralError(null);
    if (showSuccessFeedback) {
      setVerificationFeedback(null);
    }
    setIsSendingVerificationCode(true);

    try {
      await signUp.verifications.sendEmailCode();
      setHasSentVerificationCode(true);

      if (showSuccessFeedback) {
        setVerificationFeedback("Enviamos um novo código para o seu e-mail.");
      }

      return true;
    } catch (error) {
      console.error("Erro ao enviar código de verificação:", error);
      setGeneralError(
        getClerkErrorMessage(error) ||
          "Não foi possível enviar o código de verificação. Tente novamente.",
      );
      return false;
    } finally {
      setIsSendingVerificationCode(false);
    }
  };

  const handleResendVerificationCode = async () => {
    await sendVerificationCode(true);
  };

  const handleSubmit = async () => {
    const nextErrors = {
      emailAddress: validateEmailAddress(emailAddress),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };

    setLocalErrors(nextErrors);

    if (
      nextErrors.emailAddress ||
      nextErrors.password ||
      nextErrors.confirmPassword ||
      !signUp
    ) {
      if (!signUp) {
        setGeneralError(
          "A autenticação ainda está carregando. Tente novamente.",
        );
      }
      return;
    }

    setGeneralError(null);

    try {
      const { error } = await signUp.password({
        emailAddress: normalizeEmailAddress(emailAddress),
        password,
      });

      if (error) {
        setGeneralError(
          getClerkErrorMessage(error) ||
            "Não foi possível criar sua conta. Revise seus dados e tente novamente.",
        );
        return;
      }

      const codeWasSent = await sendVerificationCode();

      if (!codeWasSent) {
        return;
      }
    } catch (error) {
      setGeneralError(
        getClerkErrorMessage(error) ||
          "Não foi possível criar sua conta agora. Tente novamente.",
      );
    }
  };

  const handleVerify = async () => {
    const codeError = validateVerificationCode(code);
    setLocalErrors((currentErrors) => ({ ...currentErrors, code: codeError }));

    if (codeError || !signUp) {
      if (!signUp) {
        setGeneralError(
          "A autenticação ainda está carregando. Tente novamente.",
        );
      }
      return;
    }

    setGeneralError(null);

    try {
      const verificationResult = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (verificationResult.error) {
        setGeneralError(
          getClerkErrorMessage(verificationResult.error) ||
            "Não foi possível verificar o código. Solicite um novo e tente novamente.",
        );
        return;
      }

      // Nesta versão do Clerk, verifyEmailCode retorna apenas o erro e atualiza
      // o recurso signUp em memória. Por isso, o status final continua vindo de signUp.
      if (signUp.status === "complete") {
        await handleFinalize();
        return;
      }

      setGeneralError(
        "O código foi aceito, mas sua conta ainda precisa concluir mais uma etapa. Tente novamente.",
      );
    } catch (error) {
      setIsCompletingAccess(false);
      setGeneralError(
        getClerkErrorMessage(error) ||
          "Não foi possível verificar o código. Solicite um novo e tente novamente.",
      );
    }
  };

  if (isSignedIn && !isCompletingAccess) {
    return <Redirect href="/home" />;
  }

  if (isCompletingAccess) {
    return (
      <AuthScreen
        title="Criando seu acesso"
        subtitle="Estamos finalizando sua conta e preparando sua visão inicial."
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

  if (isVerifyingEmail) {
    return (
      <AuthScreen
        kicker="CONFIRMAÇÃO"
        title="Verifique seu e-mail"
        subtitle={`Digite o código enviado para ${normalizeEmailAddress(emailAddress)} para liberar seu acesso.`}
        note="A confirmação por e-mail garante que suas assinaturas fiquem ligadas à conta certa desde o primeiro acesso."
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
                Cole o código mais recente enviado para sua caixa de entrada.
              </Text>
            )}
          </View>

          {generalError ? (
            <Text className="auth-error">{generalError}</Text>
          ) : null}

          <Pressable
            className={clsx(
              "auth-button",
              (isSubmitting || isSendingVerificationCode || !code.trim()) &&
                "auth-button-disabled",
            )}
            disabled={isSubmitting || isSendingVerificationCode || !code.trim()}
            onPress={handleVerify}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text className="auth-button-text">Verificar e-mail</Text>
            )}
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            disabled={isSubmitting || isSendingVerificationCode}
            onPress={handleResendVerificationCode}
          >
            {isSendingVerificationCode ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text className="auth-secondary-button-text">
                Enviar novo código
              </Text>
            )}
          </Pressable>

          {verificationFeedback ? (
            <Text className="auth-helper text-center">
              {verificationFeedback}
            </Text>
          ) : null}
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      kicker="CRIAR CONTA"
      title="Crie sua conta"
      subtitle="Comece a gerenciar suas assinaturas em um só lugar"
      footerCopy="Já usa a Recurrly?"
      footerHref="/sign-in"
      footerLinkLabel="Entrar"
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
              autoComplete="new-password"
              textContentType="newPassword"
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />
          </View>
          {fieldErrors.password ? (
            <Text className="auth-error">{fieldErrors.password}</Text>
          ) : null}
        </View>

        <View className="auth-field">
          <Text className="auth-label">Confirmar senha</Text>
          <View
            className={clsx(
              "auth-input-shell",
              fieldErrors.confirmPassword && "auth-input-shell-error",
            )}
          >
            <TextInput
              className={clsx(
                "auth-input",
                fieldErrors.confirmPassword && "auth-input-error",
              )}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                clearFieldError("confirmPassword");
              }}
              placeholder="Confirme sua senha"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
              cursorColor={colors.primary}
            />
          </View>
          {fieldErrors.confirmPassword ? (
            <Text className="auth-error">{fieldErrors.confirmPassword}</Text>
          ) : null}
        </View>

        {generalError ? (
          <Text className="auth-error">{generalError}</Text>
        ) : null}

        <Pressable
          className={clsx(
            "auth-button",
            (isSubmitting ||
              isSendingVerificationCode ||
              !emailAddress ||
              !password ||
              !confirmPassword) &&
              "auth-button-disabled",
          )}
          disabled={
            isSubmitting ||
            isSendingVerificationCode ||
            !emailAddress ||
            !password ||
            !confirmPassword
          }
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text className="auth-button-text">Criar conta</Text>
          )}
        </Pressable>
      </View>
    </AuthScreen>
  );
}
