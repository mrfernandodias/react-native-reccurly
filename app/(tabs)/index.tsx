import { ScreenContainer } from "@/components/screen-container";
import { Link } from "expo-router";
import { Text } from "react-native";

export default function App() {
  return (
    <ScreenContainer>
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Sign-In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Sign-Up
      </Link>
      <Link
        href="/subscriptions/spotify"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Spotify Subscription
      </Link>
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Claude Max Subscriptions
      </Link>
    </ScreenContainer>
  );
}
