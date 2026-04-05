import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (__DEV__) {
      console.log("[root-index]", { isLoaded, isSignedIn });
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <AuthLoadingScreen
        stage="root-index"
        message="Verificando sua sessão..."
      />
    );
  }

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/sign-in" />;
}
