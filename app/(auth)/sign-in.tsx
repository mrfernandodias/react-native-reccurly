import { ScreenContainer } from "@/components/screen-container";
import { Link, usePathname } from "expo-router";
import React from "react";
import { Text } from "react-native";

const SignIn = () => {
  const pathname = usePathname();

  return (
    <ScreenContainer>
      <Text>SignIn</Text>
      <Text>{pathname}</Text>
      <Link href="/(auth)/sign-up">Create Account</Link>
    </ScreenContainer>
  );
};

export default SignIn;
