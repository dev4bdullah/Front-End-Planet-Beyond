import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  PageHeader,
  SectionCard,
  Code,
  Button,
  Row,
  Badge,
  KeyValue,
  styles as ui
} from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";

export default function Screen() {
  const insets = useSafeAreaInsets();
  const [barStyle, setBarStyle] = useState("light");

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      {/* expo-status-bar sets the bar for whichever screen is mounted */}
      <StatusBar style={barStyle} />

      <PageHeader
        number={6}
        title="Safe Area & Status Bar"
        brief="Handle notches, status bar colors, device padding, and platform-safe screen layout"
        lead="The area your content is allowed to occupy is smaller than the screen, and by a different amount on every device."
      />

      <SectionCard title="This device's insets">
        <KeyValue
          items={[
            ["top", `${insets.top}pt — status bar, notch or Dynamic Island`],
            ["bottom", `${insets.bottom}pt — home indicator or gesture bar`],
            ["left", `${insets.left}pt`],
            ["right", `${insets.right}pt — non-zero in landscape on a notched phone`]
          ]}
        />
        <Text style={ui.note}>
          {insets.top > 24
            ? "A top inset above about 24pt means a notch or Dynamic Island."
            : "A small top inset means a flat status bar — an older phone, or an emulator without a notch."}
        </Text>
      </SectionCard>

      <SectionCard
        title="Why not just add padding"
        note="Because the number is different on every device, and you cannot know it at build time. iPhone SE, iPhone 15 Pro and a Pixel with a punch-hole all report different top insets — and they change again in landscape."
      >
        <Code>{`// ❌ works on exactly one device
<View style={{ paddingTop: 44 }} />

// ❌ Android-only, and wrong on notched Androids
<View style={{ paddingTop: StatusBar.currentHeight }} />

// ✅ measured by the OS, correct everywhere
const insets = useSafeAreaInsets();
<View style={{ paddingTop: insets.top }} />`}</Code>
      </SectionCard>

      <SectionCard
        title="SafeAreaView or useSafeAreaInsets"
        note="Both come from react-native-safe-area-context — never from react-native itself, whose SafeAreaView is iOS-only and does nothing on Android."
      >
        <Code>{`// ✅ the library — works on both platforms
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// ❌ built-in — a no-op on Android
import { SafeAreaView } from "react-native";

// SafeAreaView: simple, applies padding automatically
<SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>

// useSafeAreaInsets: full control — needed when the inset has to go
// somewhere other than padding
<FlatList contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} />`}</Code>
        <Text style={ui.note}>
          The <Text style={{ color: colors.text }}>edges</Text> prop matters. On a screen inside a
          bottom tab navigator you want{" "}
          <Text style={{ color: colors.text }}>edges={'{["top"]}'}</Text> — the tab bar already
          handles the bottom, and applying both leaves a visible gap.
        </Text>
      </SectionCard>

      <SectionCard title="What the inset actually protects">
        <View style={s.phone}>
          <View style={[s.unsafe, { height: Math.max(insets.top, 20) }]}>
            <Text style={s.unsafeText}>status bar / notch — {insets.top}pt</Text>
          </View>
          <View style={s.safe}>
            <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>Safe area</Text>
            <Text style={[type.tiny, { color: colors.textMuted }]}>your content belongs here</Text>
          </View>
          <View style={[s.unsafe, { height: Math.max(insets.bottom, 16) }]}>
            <Text style={s.unsafeText}>home indicator — {insets.bottom}pt</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard
        title="Status bar style"
        note="Try both. The bar is transparent, so the style controls whether its icons are light or dark — get it wrong on a light background and the clock disappears."
      >
        <Row gap={spacing.sm}>
          <Button
            label="light icons"
            size="sm"
            variant={barStyle === "light" ? "primary" : "ghost"}
            onPress={() => setBarStyle("light")}
          />
          <Button
            label="dark icons"
            size="sm"
            variant={barStyle === "dark" ? "primary" : "ghost"}
            onPress={() => setBarStyle("dark")}
          />
        </Row>
        <Text style={ui.note}>
          On this dark background, <Text style={{ color: colors.text }}>dark</Text> makes the clock
          and battery nearly invisible. That’s the failure mode.
        </Text>
        <Code>{`import { StatusBar } from "expo-status-bar";

<StatusBar style="light" />        // light icons, for a dark background
<StatusBar style="dark" />         // dark icons, for a light background
<StatusBar style="auto" />         // follows the colour scheme

// It's a component, not a global setting — mount it per screen and each
// screen can set its own.`}</Code>
      </SectionCard>

      <SectionCard title="The platform difference">
        <View style={{ gap: spacing.sm }}>
          <Row gap={spacing.sm}>
            <Badge label="iOS" tone="brand" />
            <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>
              The status bar always overlays the app. Insets come from the notch and the home
              indicator, and change in landscape.
            </Text>
          </Row>
          <Row gap={spacing.sm}>
            <Badge label="Android" tone="success" />
            <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>
              Historically the app sat below the status bar. With{" "}
              <Text style={{ color: colors.text }}>edgeToEdgeEnabled</Text> — required from Android
              15 — it draws behind it, so insets now matter as much as on iOS.
            </Text>
          </Row>
        </View>
        <KeyValue
          items={[
            ["Platform.OS", Platform.OS],
            ["StatusBar.currentHeight", String(RNStatusBar.currentHeight ?? "undefined (iOS)")],
            ["Reported top inset", `${insets.top}pt`]
          ]}
        />
        <Text style={ui.note}>
          <Text style={{ color: colors.text }}>StatusBar.currentHeight</Text> is Android-only and{" "}
          <Text style={{ color: colors.text }}>undefined</Text> on iOS — which is why using it for
          padding produces NaN and a silently broken layout on half your users’ devices.
        </Text>
      </SectionCard>

      <SectionCard
        title="Where the provider goes"
        note="SafeAreaProvider wraps the whole app, once, above the navigation container. Without it, useSafeAreaInsets returns zeros and everything looks fine on a device with no notch."
      >
        <Code>{`// src/App.jsx
<SafeAreaProvider>
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
</SafeAreaProvider>`}</Code>
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  phone: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: "hidden",
    minHeight: 190
  },
  unsafe: {
    backgroundColor: "rgba(239,68,68,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  unsafeText: { ...type.tiny, color: colors.danger },
  safe: {
    flex: 1,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: spacing.lg
  }
});
