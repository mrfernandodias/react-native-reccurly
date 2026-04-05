import { useClerk, useUser } from "@clerk/expo";
import { ScreenContainer } from "@/components/screen-container";
import images from "@/constants/images";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

const Settings = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
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
                <Text className="font-sans-bold text-primary">
                  Sessão protegida
                </Text>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Verificação
                </Text>
                <Text className="font-sans-bold text-primary">
                  E-mail confirmado
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

            <Pressable className="auth-button mt-5" onPress={handleSignOut}>
              <Text className="auth-button-text">Sair</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

export default Settings;
