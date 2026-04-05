import "@/global.css";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (__DEV__) {
      console.log("[auth-layout]", { isLoaded, isSignedIn });
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <AuthLoadingScreen
        stage="auth-layout"
        message="Preparando acesso seguro..."
      />
    );
  }

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
