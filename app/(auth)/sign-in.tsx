import { ScreenContainer } from "@/components/screen-container";
import { Link } from "expo-router";
import React from "react";
import { Text } from "react-native";

const SignIn = () => {
  return (
    <ScreenContainer>
      <Text>SignIn</Text>
      <Link href="/(auth)/sign-up">Create Account</Link>
    </ScreenContainer>
  );
};

export default SignIn;
