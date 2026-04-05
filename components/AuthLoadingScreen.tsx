import images from "@/constants/images";
import { colors } from "@/constants/theme";
import { styled } from "nativewind";
import { useEffect } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface AuthLoadingScreenProps {
  message?: string;
  stage?: string;
}

export default function AuthLoadingScreen({
  message = "Preparando seu espaço...",
  stage = "auth-loading",
}: AuthLoadingScreenProps) {
  useEffect(() => {
    if (__DEV__) {
      console.log("[auth-loading]", { stage, message });
    }
  }, [message, stage]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={images.splashPattern}
          resizeMode="cover"
          className="absolute inset-x-0 bottom-0 h-72 w-full opacity-25"
        />

        <View className="items-center">
          <View className="flex-row items-center gap-4">
            <Image source={images.logo} className="size-18 rounded-3xl" />
            <View>
              <Text className="text-4xl font-sans-extrabold text-primary">
                Recurrly
              </Text>
              <Text className="text-sm font-sans-semibold uppercase tracking-[1.8px] text-muted-foreground">
                COBRANÇA INTELIGENTE
              </Text>
            </View>
          </View>

          <View className="mt-10 items-center gap-4">
            <ActivityIndicator color={colors.accent} size="large" />
            <Text className="text-center text-base font-sans-medium text-muted-foreground">
              {message}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
