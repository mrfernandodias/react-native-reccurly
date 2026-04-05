import images from "@/constants/images";
import type { Href } from "expo-router";
import { Link } from "expo-router";
import type { PropsWithChildren } from "react";
import { styled } from "nativewind";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface AuthScreenProps extends PropsWithChildren {
  kicker?: string;
  title: string;
  subtitle: string;
  subtitleSingleLine?: boolean;
  footerCopy?: string;
  footerHref?: Href;
  footerLinkLabel?: string;
  note?: string;
}

export default function AuthScreen({
  kicker,
  title,
  subtitle,
  subtitleSingleLine = false,
  footerCopy,
  footerHref,
  footerLinkLabel,
  note,
  children,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={images.splashPattern}
            resizeMode="cover"
            className="absolute inset-x-0 bottom-0 h-80 w-full opacity-25"
          />

          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <Image source={images.logo} className="auth-logo-image" />
              <View>
                <Text className="auth-wordmark">Recurrly</Text>
                <Text className="auth-wordmark-sub">COBRANÇA INTELIGENTE</Text>
              </View>
            </View>

            {kicker ? (
              <Text className="mb-3 text-center text-xs font-sans-semibold uppercase tracking-[1.8px] text-accent">
                {kicker}
              </Text>
            ) : null}
            <Text className="auth-title">{title}</Text>
            <Text
              className="auth-subtitle"
              numberOfLines={subtitleSingleLine ? 1 : undefined}
              adjustsFontSizeToFit={subtitleSingleLine}
              minimumFontScale={subtitleSingleLine ? 0.85 : undefined}
            >
              {subtitle}
            </Text>
          </View>

          <View className="auth-card">
            {children}

            {note ? (
              <Text className="mt-5 text-center text-xs font-sans-medium text-muted-foreground">
                {note}
              </Text>
            ) : null}

            {footerCopy && footerHref && footerLinkLabel ? (
              <View className="auth-link-row">
                <Text className="auth-link-copy">{footerCopy}</Text>
                <Link href={footerHref}>
                  <Text className="auth-link">{footerLinkLabel}</Text>
                </Link>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
