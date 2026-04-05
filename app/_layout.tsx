import "@/global.css";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

/**
 * Root layout component that loads PlusJakartaSans fonts, manages the splash screen, and renders the app navigation stack.
 *
 * @returns `null` while fonts are still loading and no error has occurred; a centered error view with the message
 * "Failed to load fonts. Please restart the app." if font loading fails; otherwise the navigation `<Stack>` with
 * headers hidden.
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
    if (fontsLoaded || error) {
      SplashScreen.hideAsync().catch((hideError) => {
        console.warn("SplashScreen hide error:", hideError);
      });
    }
  }, [fontsLoaded, error]);

  if (error) {
    console.error("Font loading error:", error);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Failed to load fonts. Please restart the app.</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
