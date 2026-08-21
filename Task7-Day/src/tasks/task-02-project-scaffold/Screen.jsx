import { ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { PageHeader, SectionCard, Code, Badge, Row, KeyValue, styles as ui } from "../../shared/ui";
import { colors, spacing, type } from "../../theme";

export default function Screen() {
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={2}
        title="Project Scaffold"
        brief="Create a bare React Native app and verify it runs on emulator or physical device"
        lead="This app is the scaffold. Metro is serving it to whatever you're reading this on."
      />

      <SectionCard title="Running right now">
        <KeyValue
          items={[
            ["App name", Constants.expoConfig?.name ?? "—"],
            ["Slug", Constants.expoConfig?.slug ?? "—"],
            ["Entry point", "index.js → src/App.jsx"],
            ["Mode", __DEV__ ? "development (Metro)" : "production bundle"]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="The entry point is not index.html"
        note="There is no DOM and no HTML file. A native view hierarchy is registered instead, which is the first genuine difference from web React."
      >
        <Code>{`// index.js
import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
// → AppRegistry.registerComponent("main", () => App)`}</Code>
        <Text style={ui.note}>
          <Text style={{ color: colors.text }}>AppRegistry</Text> is React Native’s equivalent of{" "}
          <Text style={{ color: colors.text }}>createRoot</Text>. It hands your component tree to
          the native host, which renders real UIView or android.view objects — not a browser.
        </Text>
      </SectionCard>

      <SectionCard title="What each file does">
        <KeyValue
          items={[
            ["index.js", "registers the root component"],
            ["app.json", "app name, icons, splash, bundle ids, platform config"],
            ["babel.config.js", "babel-preset-expo — JSX, Flow types, module resolution"],
            ["package.json", "the scripts you actually run"],
            ["src/App.jsx", "providers and the navigation container"]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="app.json is not decoration"
        note="It's the closest thing to a manifest. Get the bundle identifier wrong and a build fails at the very end, after ten minutes of compiling."
      >
        <Code>{`{
  "expo": {
    "name": "Day 7 — React Native Basics",
    "slug": "day7-react-native-basics",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios":     { "bundleIdentifier": "com.dev4bdullah.day7" },
    "android": { "package": "com.dev4bdullah.day7",
                 "edgeToEdgeEnabled": true }
  }
}`}</Code>
        <Text style={ui.note}>
          <Text style={{ color: colors.text }}>edgeToEdgeEnabled</Text> on Android draws behind the
          system bars — which is why task 6 exists. Without safe-area handling, content ends up
          under the status bar.
        </Text>
      </SectionCard>

      <SectionCard title="Verify it runs">
        <Code>{`npx expo start

  a  → open on the Android emulator
  i  → open on the iOS simulator (macOS)
  w  → open in a browser
  r  → reload the app
  m  → toggle the dev menu
  j  → open the debugger`}</Code>
        <View style={{ gap: spacing.xs }}>
          <Row>
            <Badge label="works" tone="success" />
            <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>
              you see this screen, and saving a file reloads it
            </Text>
          </Row>
          <Row>
            <Badge label="blank white" tone="warning" />
            <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>
              usually a JS error — shake the device for the red box
            </Text>
          </Row>
          <Row>
            <Badge label="stuck bundling" tone="danger" />
            <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>
              phone and Metro on different networks, or port 8081 blocked
            </Text>
          </Row>
        </View>
      </SectionCard>

      <SectionCard
        title="Metro is not Vite"
        note="Different bundler, different failure modes. Two habits worth forming early."
      >
        <Code>{`npx expo start -c        # clear the Metro cache — fixes a
                         # surprising share of "module not found"

# Fast Refresh keeps component state across a save.
# It gives up and does a full reload when you edit a file that
# exports something other than a component — a constants file,
# for example. That's expected, not a bug.`}</Code>
      </SectionCard>
    </ScrollView>
  );
}
