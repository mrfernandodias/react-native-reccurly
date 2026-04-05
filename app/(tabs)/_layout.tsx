import { useAuth } from "@clerk/expo";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { clsx } from "clsx";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;

/**
 * Renderiza a navegação principal por abas do app.
 * Ajusta o posicionamento e o tamanho da tab bar com base na safe area do dispositivo.
 */
const TabLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (__DEV__) {
      console.log("[tabs-layout]", { isLoaded, isSignedIn });
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <AuthLoadingScreen
        stage="tabs-layout"
        message="Restaurando seu painel..."
      />
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className="tabs-icon">
        <View className={clsx("tabs-pill", focused && "tabs-active")}>
          <Image source={icon} resizeMode="contain" className="tabs-glyph" />
        </View>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          elevation: 0,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          paddingVertical: Math.max(
            0,
            tabBar.height / 2 - tabBar.iconFrame / 1.6,
          ),
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
