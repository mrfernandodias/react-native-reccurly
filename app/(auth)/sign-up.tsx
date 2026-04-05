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
import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { clsx } from "clsx";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<{
    emailAddress?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
  }>({});

  const isSubmitting = fetchStatus === "fetching";
  const isVerifyingEmail =
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
        setGeneralError("A autenticação ainda está carregando. Tente novamente.");
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

      await signUp.verifications.sendEmailCode();
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
        setGeneralError("A autenticação ainda está carregando. Tente novamente.");
      }
      return;
    }

    setGeneralError(null);

    try {
      await signUp.verifications.verifyEmailCode({ code: code.trim() });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              setGeneralError(
                "Sua conta foi criada, mas ainda falta uma etapa de segurança.",
              );
              return;
            }

            navigateWithDecoratedUrl(decorateUrl("/"), (href) =>
              router.replace(href),
            );
          },
        });
        return;
      }

      setGeneralError(
        "O código foi aceito, mas sua conta ainda precisa concluir mais uma etapa. Tente novamente.",
      );
    } catch (error) {
      setGeneralError(
        getClerkErrorMessage(error) ||
          "Não foi possível verificar o código. Solicite um novo e tente novamente.",
      );
    }
  };

  if (signUp?.status === "complete" || isSignedIn) {
    return <Redirect href="/" />;
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
              (isSubmitting || !code.trim()) && "auth-button-disabled",
            )}
            disabled={isSubmitting || !code.trim()}
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
            disabled={isSubmitting}
            onPress={() => signUp?.verifications.sendEmailCode()}
          >
            <Text className="auth-secondary-button-text">Enviar novo código</Text>
          </Pressable>
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

        {generalError ? <Text className="auth-error">{generalError}</Text> : null}

        <Pressable
          className={clsx(
            "auth-button",
            (isSubmitting || !emailAddress || !password || !confirmPassword) &&
              "auth-button-disabled",
          )}
          disabled={isSubmitting || !emailAddress || !password || !confirmPassword}
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
