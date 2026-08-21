import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";
import { ThemeProvider, FavoritesProvider, useTheme } from "./hooks";
import RootNavigator from "./navigation/RootNavigator";
import { linking } from "./navigation/linking";

/* Provider order matters:

   GestureHandlerRootView  — required by the drawer, outermost
   SafeAreaProvider        — or useSafeAreaInsets silently returns zeroes
   ThemeProvider           — NavigationContainer's theme reads from it
   FavoritesProvider       — needs nothing above it but the storage hook
   NavigationContainer     — one per app */

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

  /* AsyncStorage is asynchronous, so the stored theme isn't known on the first
     render. Holding here avoids the flash of the wrong theme on launch —
     task 10 explains the mechanism. */
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
    <NavigationContainer theme={navTheme} linking={linking}>
      {/* "light" means light CONTENT — so it's what a dark app wants */}
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
          <FavoritesProvider>
            <Shell />
          </FavoritesProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
