import { ScrollView, View, Text, StyleSheet, Platform } from "react-native";
import { PageHeader, SectionCard, Code, Badge, Row, KeyValue, styles as ui } from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";

/* Task 7 — Platform.select is the tool, but the interesting part is knowing
   which differences are real and which are cargo cult. */

const platformStyles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6
      },
      android: { elevation: 4 },
      default: { borderWidth: 1, borderColor: colors.border }
    })
  }
});

export default function Screen() {
  const isIOS = Platform.OS === "ios";

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={7}
        title="Platform Handling"
        brief="Use Platform.select for small iOS/Android styling or behavior differences"
        lead="Small differences, handled in one place. Two whole codebases is the failure mode this avoids."
      />

      <SectionCard title="What you're running on">
        <Row gap={spacing.sm}>
          <Badge label={Platform.OS} tone="brand" />
          <Badge label={`v${Platform.Version}`} />
          {Platform.OS === "ios" && Platform.isPad ? <Badge label="iPad" tone="success" /> : null}
        </Row>
        <KeyValue
          items={[
            ["Platform.OS", Platform.OS],
            ["Platform.Version", String(Platform.Version)],
            ["Selected below", isIOS ? "the ios branch" : "the android branch"]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Platform.select"
        note="Takes an object keyed by platform and returns the matching value. Spread it into a style, or use it for any value at all."
      >
        <View style={platformStyles.card}>
          <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>
            This card is styled by Platform.select
          </Text>
          <Text style={[type.tiny, { color: colors.textMuted }]}>
            {isIOS ? "shadowColor + shadowOffset + shadowRadius" : "elevation: 4"}
          </Text>
        </View>

        <Code>{`const styles = StyleSheet.create({
  card: {
    padding: 12,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 4 },
      default: { borderWidth: 1 }        // web, or anything else
    })
  }
});`}</Code>
      </SectionCard>

      <SectionCard title="Three ways to branch">
        <Code>{`// 1. Platform.select — for a value or a style block
const font = Platform.select({ ios: "Menlo", android: "monospace" });

// 2. Platform.OS — for a whole branch of behaviour
if (Platform.OS === "android") {
  requestAndroidPermission();
}

// 3. Platform-specific files — Metro resolves the extension for you
//    Button.ios.js
//    Button.android.js
//    import Button from "./Button";   ← no extension, right file picked

// Use 3 only when the two implementations genuinely diverge.
// For a shadow, option 1 is the right size of tool.`}</Code>
      </SectionCard>

      <SectionCard
        title="Differences that are real"
        note="Worth handling. Ignoring these produces a visibly wrong app on one platform."
      >
        <View style={{ gap: spacing.sm }}>
          {[
            ["Shadows", "iOS uses four shadow props; Android uses elevation and ignores them"],
            ["Press feedback", "Android expects a ripple; iOS expects an opacity fade"],
            ["Keyboard", "iOS pushes content up with padding; Android usually resizes the window"],
            ["Fonts", "system fonts differ — San Francisco vs Roboto; monospace names differ"],
            ["Back gesture", "Android has a hardware back button; iOS has an edge swipe"],
            ["Status bar", "Android needs edge-to-edge config; iOS always overlays"]
          ].map(([area, detail]) => (
            <Row key={area} gap={spacing.sm}>
              <Badge label={area} tone="warning" />
              <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>{detail}</Text>
            </Row>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="Differences that usually aren't"
        note="Reaching for Platform.select here tends to make the app inconsistent for no benefit."
      >
        <View style={{ gap: spacing.xs }}>
          {[
            "Spacing and padding — a 16pt gutter is 16pt on both",
            "Colours — your brand doesn't change per platform",
            "Corner radii — pick one and hold to it",
            "Copy and labels — different wording per platform is a maintenance tax",
            "Layout structure — if a screen needs a different structure, question the design"
          ].map(item => (
            <Row key={item} gap={spacing.sm}>
              <Text style={{ color: colors.textFaint }}>·</Text>
              <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>{item}</Text>
            </Row>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="The keyboard, which is the one that bites"
        note="Not styling — behaviour. The same code produces different results, and the fix is a prop rather than a branch."
      >
        <Code>{`<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
  style={{ flex: 1 }}
>

// iOS: the keyboard overlays the app, so content needs padding pushed up.
// Android: the window is usually resized already, so "height" or even
// nothing at all is correct — "padding" can double-shift the layout.`}</Code>
        <Text style={ui.note}>Task 10 uses exactly this on the form screen.</Text>
      </SectionCard>

      <SectionCard
        title="Version checks"
        note="Platform.Version is a number on Android (the API level) and a string on iOS. Comparing them the same way is a real bug."
      >
        <Code>{`// Android: 34, 35 …          iOS: "17.4"
const isAndroid13Plus = Platform.OS === "android" && Platform.Version >= 33;
const isIOS16Plus = Platform.OS === "ios" && parseInt(Platform.Version, 10) >= 16;

// ❌ silently false on iOS, because "17.4" >= 33 is a string comparison
if (Platform.Version >= 33) { … }`}</Code>
      </SectionCard>
    </ScrollView>
  );
}
