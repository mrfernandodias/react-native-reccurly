import { useAuth, useClerk, useUser } from "@clerk/expo";
import { ScreenContainer } from "@/components/screen-container";
import images from "@/constants/images";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { useState } from "react";

const Settings = () => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isEmailVerified =
    user?.primaryEmailAddress?.verification?.status === "verified";
  const sessionStatusLabel = isSignedIn
    ? "Sessão protegida"
    : "Sessão não protegida";
  const verificationStatusLabel = isEmailVerified
    ? "E-mail confirmado"
    : "E-mail não confirmado";
  const statusTextClassName = isSignedIn
    ? "font-sans-bold text-primary"
    : "font-sans-bold text-muted-foreground";
  const verificationTextClassName = isEmailVerified
    ? "font-sans-bold text-primary"
    : "font-sans-bold text-muted-foreground";

  const handleSignOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Erro ao encerrar a sessão:", error);
      setSignOutError(
        "Não foi possível encerrar a sessão agora. Tente novamente.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScreenContainer>
      {!isLoaded ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View className="flex-1 gap-5">
          <Text className="list-title">Conta</Text>

          <View className="rounded-3xl border border-border bg-card p-5">
            <View className="flex-row items-center gap-4">
              <Image
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                className="size-16 rounded-full"
              />
              <View className="flex-1">
                <Text className="text-xl font-sans-bold text-primary">
                  {user?.fullName || user?.firstName || "Seu espaço"}
                </Text>
                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress ||
                    "Nenhum e-mail disponível"}
                </Text>
              </View>
            </View>

            <View className="mt-6 gap-4">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Acesso
                </Text>
                <Text className={statusTextClassName}>{sessionStatusLabel}</Text>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Verificação
                </Text>
                <Text className={verificationTextClassName}>
                  {verificationStatusLabel}
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-3xl border border-border bg-card p-5">
            <Text className="text-base font-sans-bold text-primary">
              Controles da sessão
            </Text>
            <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
              Use sair quando estiver em um dispositivo compartilhado ou quando
              quiser trocar de conta.
            </Text>

            {signOutError ? (
              <Text className="auth-error mt-4">{signOutError}</Text>
            ) : null}

            <Pressable
              className="auth-button mt-5"
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text className="auth-button-text">Sair</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

export default Settings;
