import { colors } from "@/constants/theme";
import { clsx } from "clsx";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface AuthPasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  errorMessage?: string;
  autoComplete?: "password" | "new-password";
  textContentType?: "password" | "newPassword";
  onChangeText: (value: string) => void;
}

export default function AuthPasswordField({
  label,
  value,
  placeholder,
  errorMessage,
  autoComplete,
  textContentType,
  onChangeText,
}: AuthPasswordFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View
        className={clsx(
          "auth-input-shell auth-input-row",
          errorMessage && "auth-input-shell-error",
        )}
      >
        <TextInput
          className={clsx(
            "auth-input auth-input-field",
            errorMessage && "auth-input-error",
          )}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={!isPasswordVisible}
          autoComplete={autoComplete}
          textContentType={textContentType}
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          cursorColor={colors.primary}
        />

        <Pressable
          onPress={() => setIsPasswordVisible((currentValue) => !currentValue)}
          accessibilityRole="button"
          accessibilityLabel={
            isPasswordVisible ? "Ocultar senha" : "Mostrar senha"
          }
          className="auth-input-action"
          hitSlop={10}
        >
          <Text className="auth-input-action-text">
            {isPasswordVisible ? "Ocultar" : "Mostrar"}
          </Text>
        </Pressable>
      </View>

      {errorMessage ? <Text className="auth-error">{errorMessage}</Text> : null}
    </View>
  );
}
