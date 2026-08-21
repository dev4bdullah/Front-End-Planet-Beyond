import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./navigation/RootNavigator";
import { colors } from "./theme";

/* SafeAreaProvider has to be the outermost wrapper — useSafeAreaInsets
   returns zeroes without it, and the failure is silent: the layout simply
   sits under the notch. */

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.brand
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        {/* "light" means light CONTENT on a dark bar — the naming trips
            everyone up at least once */}
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
