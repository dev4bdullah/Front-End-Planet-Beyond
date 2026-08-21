import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";
import { ThemeProvider, NetworkProvider, useTheme } from "./hooks";
import { ToastProvider } from "./tasks/task-08-toast-alert-feedback/lib/ToastContext";
import RootNavigator from "./navigation/RootNavigator";

/* Provider order:

   GestureHandlerRootView — required by anything gesture-driven, outermost
   SafeAreaProvider       — or useSafeAreaInsets silently returns zeroes
   ThemeProvider          — ToastProvider and the navigators read colours from it
   NetworkProvider        — task 11's connectivity, needed app-wide
   ToastProvider          — renders its own viewport, so it must sit above
                            the navigator it draws over */

function Shell() {
  const { colors, resolved, hydrated } = useTheme();

  const navTheme = {
    ...(resolved === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolved === "dark" ? DarkTheme : DefaultTheme).colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.brand
    }
  };

  // AsyncStorage is asynchronous, so the stored theme isn't known on the first
  // render. Holding here avoids the flash of the wrong theme on launch.
  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NetworkProvider>
            <ToastProvider>
              <Shell />
            </ToastProvider>
          </NetworkProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
