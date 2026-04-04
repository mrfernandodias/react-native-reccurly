import { styled } from "nativewind";
import type { PropsWithChildren } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">{children}</SafeAreaView>
  );
}
