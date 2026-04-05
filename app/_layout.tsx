import "@/global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Adicione sua chave publicável do Clerk ao arquivo .env");
}

/**
 * Layout raiz do app que carrega as fontes Plus Jakarta Sans, controla a splash
 * screen e renderiza a navegação principal.
 *
 * @returns Uma tela de erro centralizada caso as fontes falhem, uma tela de
 * carregamento enquanto os recursos ainda estão iniciando, ou a navegação
 * principal quando tudo estiver pronto.
 */
export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (__DEV__) {
      console.log("[root-layout]", {
        fontsLoaded,
        hasFontError: Boolean(error),
        hasPublishableKey: Boolean(publishableKey),
      });
    }

    if (fontsLoaded || error) {
      SplashScreen.hideAsync().catch((hideError) => {
        console.warn("Erro ao ocultar a SplashScreen:", hideError);
      });
    }
  }, [fontsLoaded, error]);

  if (error) {
    console.error("Erro ao carregar fontes:", error);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Não foi possível carregar as fontes. Reinicie o app.</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          backgroundColor: "#fff9e3",
          gap: 16,
        }}
      >
        <ActivityIndicator size="large" color="#ea7a53" />
        <Text style={{ fontSize: 16, textAlign: "center", color: "#59554e" }}>
          Carregando recursos do app...
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  );
}
