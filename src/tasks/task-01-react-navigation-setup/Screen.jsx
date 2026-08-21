import { useNavigationState, useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import {
  Screen,
  PageHeader,
  SectionCard,
  Code,
  Badge,
  Row,
  Button,
  KeyValue
} from "../../shared/ui";
import { useTheme } from "../../hooks";
import { spacing, type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Reading the live navigation state, so the tree shown is the real one
  const routeNames = useNavigationState(state => state?.routeNames ?? []);
  const index = useNavigationState(state => state?.index ?? 0);

  return (
    <Screen>
      <PageHeader
        number={1}
        title="React Navigation Setup"
        brief="Install React Navigation and configure navigation container dependencies correctly"
        lead="Four packages, one provider, and two lines that people forget — after which nothing works and nothing warns."
      />

      <SectionCard
        title="Install"
        note="The core package plus one per navigator type, and two native dependencies the drawer needs."
      >
        <Code>{`npx expo install \\
  @react-navigation/native \\
  @react-navigation/native-stack \\
  @react-navigation/bottom-tabs \\
  @react-navigation/drawer \\
  react-native-screens \\
  react-native-safe-area-context \\
  react-native-gesture-handler \\
  react-native-reanimated`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Use <Text style={{ fontWeight: "700" }}>npx expo install</Text>, not npm install. It picks
          the version matching your Expo SDK; npm picks the newest, which is frequently a version
          the SDK doesn’t support yet.
        </Text>
      </SectionCard>

      <SectionCard
        title="The two lines people forget"
        note="Neither produces an error. The app builds, runs, and then behaves oddly in a way that points nowhere."
      >
        <Code>{`// index.js — FIRST import, before anything touches React Native
import "react-native-gesture-handler";

// App.jsx — SafeAreaProvider must wrap NavigationContainer
<SafeAreaProvider>
  <NavigationContainer>…</NavigationContainer>
</SafeAreaProvider>`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Without the gesture-handler import, the drawer simply doesn’t respond to swipes. Without
          SafeAreaProvider, insets read as zero and headers sit under the notch. Both fail silently,
          which is why they’re worth memorising rather than debugging.
        </Text>
      </SectionCard>

      <SectionCard
        title="NavigationContainer"
        note="One per app, at the root. It holds the navigation state and the linking config; everything below it can call useNavigation."
      >
        <Code>{`export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer theme={navTheme} linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}`}</Code>
      </SectionCard>

      <SectionCard
        title="Reanimated v4 changed the setup"
        note="Most tutorials online still tell you to add a Babel plugin. Doing that now breaks the build."
      >
        <Code>{`// babel.config.js — v2 and v3 needed this:
plugins: ["react-native-reanimated/plugin"]   // ❌ now a duplicate-plugin error

// v4: babel-preset-expo already includes the worklets transform.
presets: ["babel-preset-expo"]                 // that's all`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Reanimated 4 also splits the worklets runtime into{" "}
          <Text style={{ fontWeight: "700" }}>react-native-worklets</Text>, which is why it appears
          in this project’s dependencies without being imported anywhere.
        </Text>
      </SectionCard>

      <SectionCard
        title="This app's live navigation state"
        note="Read from useNavigationState, so it reflects the actual tree rather than a diagram."
      >
        <KeyValue
          items={[
            ["Routes at this level", routeNames.join(", ") || "—"],
            ["Active index", index],
            ["Can go back", String(navigation.canGoBack())]
          ]}
        />
        <Row>
          <Button
            label="Open the drawer"
            size="sm"
            onPress={() => navigation.getParent("drawer")?.openDrawer?.()}
          />
          <Button
            label="Go back"
            size="sm"
            variant="ghost"
            disabled={!navigation.canGoBack()}
            onPress={() => navigation.goBack()}
          />
        </Row>
      </SectionCard>

      <SectionCard
        title="Version pinning, honestly"
        note="This project pins react-native-reanimated to 4.5.1 because that's what Expo SDK 57 ships."
      >
        <Code>{`# reanimated 4.5.x declares:  peer react-native "0.83 - 0.86"
# Expo SDK 57 ships:          react-native 0.87.0

# npm therefore refuses the install without --legacy-peer-deps.
# Expo's own bundledNativeModules.json pairs exactly these two versions,
# so the peer range is simply narrower than reality.`}</Code>

        <Row>
          <Badge label="expo 57.0.14" />
          <Badge label="react-native 0.87" />
          <Badge label="reanimated 4.5.1" tone="warning" />
        </Row>
        <Text style={[type.small, { color: colors.textMuted }]}>
          If <Text style={{ fontWeight: "700" }}>npm install</Text> fails on peer dependencies, that
          mismatch is why — see the README.
        </Text>
      </SectionCard>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}
