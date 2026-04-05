import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function SubscriptionRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <AuthLoadingScreen
        stage="subscription-layout"
        message="Abrindo detalhes da assinatura..."
      />
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
