import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { PageHeader, SectionCard, Code, Button, Row, Badge, styles as ui } from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";

const JUSTIFY = ["flex-start", "center", "flex-end", "space-between", "space-around"];
const ALIGN = ["flex-start", "center", "flex-end", "stretch"];

export default function Screen() {
  const { width, height } = useWindowDimensions();
  const [justify, setJustify] = useState("flex-start");
  const [align, setAlign] = useState("flex-start");
  const [direction, setDirection] = useState("row");

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={5}
        title="StyleSheet & Flexbox"
        brief="Use StyleSheet.create, Flexbox, spacing tokens, typography, shadows, and responsive sizing"
        lead="Flexbox, but with different defaults from the web — and that difference catches everyone once."
      />

      <SectionCard
        title="The default is column, not row"
        note="On the web, flex-direction defaults to row. In React Native it defaults to column, because a phone is tall. Every View is already a flex container — there is no display: flex."
      >
        <Code>{`/* web */                    /* React Native */
display: flex;               // implicit — every View is one
flex-direction: row;         flexDirection: "column"   ← the default`}</Code>
      </SectionCard>

      <SectionCard title="Try it" note="Change the props and watch the three boxes move.">
        <View style={{ gap: spacing.sm }}>
          <Text style={s.label}>flexDirection</Text>
          <Row gap={spacing.xs}>
            {["row", "column", "row-reverse"].map(value => (
              <Button
                key={value}
                size="sm"
                label={value}
                variant={direction === value ? "primary" : "ghost"}
                onPress={() => setDirection(value)}
              />
            ))}
          </Row>

          <Text style={s.label}>justifyContent — along the main axis</Text>
          <Row gap={spacing.xs}>
            {JUSTIFY.map(value => (
              <Button
                key={value}
                size="sm"
                label={value.replace("flex-", "")}
                variant={justify === value ? "primary" : "ghost"}
                onPress={() => setJustify(value)}
              />
            ))}
          </Row>

          <Text style={s.label}>alignItems — across the cross axis</Text>
          <Row gap={spacing.xs}>
            {ALIGN.map(value => (
              <Button
                key={value}
                size="sm"
                label={value.replace("flex-", "")}
                variant={align === value ? "primary" : "ghost"}
                onPress={() => setAlign(value)}
              />
            ))}
          </Row>
        </View>

        <View
          style={[
            s.playground,
            { flexDirection: direction, justifyContent: justify, alignItems: align }
          ]}
        >
          <View style={[s.pBox, { backgroundColor: colors.brand }]}>
            <Text style={s.pBoxText}>1</Text>
          </View>
          <View style={[s.pBox, { backgroundColor: colors.success, minHeight: 56 }]}>
            <Text style={s.pBoxText}>2</Text>
          </View>
          <View style={[s.pBox, { backgroundColor: colors.warning }]}>
            <Text style={s.pBoxText}>3</Text>
          </View>
        </View>

        <Code>{`flexDirection: "${direction}",
justifyContent: "${justify}",
alignItems: "${align}"`}</Code>
        <Text style={ui.note}>
          Box 2 is taller on purpose — it’s what makes{" "}
          <Text style={{ color: colors.text }}>alignItems</Text> visible. With{" "}
          <Text style={{ color: colors.text }}>stretch</Text>, boxes 1 and 3 grow to match it.
        </Text>
      </SectionCard>

      <SectionCard
        title="StyleSheet.create, and why not a plain object"
        note="It validates keys at startup and gives the bridge a stable reference instead of a new object every render. On the New Architecture the performance gap is small; the validation is still worth it."
      >
        <Code>{`const s = StyleSheet.create({
  card: { padding: 12, borderRadius: 10 }
});

// arrays compose, later wins — the closest thing RN has to a cascade
<View style={[s.card, isActive && s.cardActive, style]} />

// a typo is caught at startup, not silently ignored
StyleSheet.create({ card: { paddingg: 12 } });   // throws`}</Code>
      </SectionCard>

      <SectionCard
        title="Six web habits that don't exist here"
        note="Not 'discouraged' — genuinely absent from the style system."
      >
        <View style={{ gap: spacing.xs }}>
          {[
            ["No units", 'padding: 12, not "12px" — a string throws'],
            ["No cascade", "a colour on a View never reaches Text inside it"],
            ["No shorthand", 'no `margin: "0 auto"`; use marginHorizontal'],
            ["camelCase only", "backgroundColor, not background-color"],
            ["No % for everything", "widths yes, most other properties no"],
            ["No media queries", "useWindowDimensions + Platform instead"]
          ].map(([rule, detail]) => (
            <Row key={rule} gap={spacing.sm}>
              <Badge label={rule} tone="brand" />
              <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>{detail}</Text>
            </Row>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="Responsive sizing without media queries"
        note="useWindowDimensions is a hook, so it re-renders on rotation. Dimensions.get('window') is read once and goes stale — the classic rotation bug."
      >
        <Code>{`// ✅ updates on rotation and on a foldable opening
const { width } = useWindowDimensions();
const columns = width > 600 ? 3 : 2;

// ❌ read once at module load, never updates
const { width } = Dimensions.get("window");`}</Code>
        <View style={s.dims}>
          <Text style={[type.small, { color: colors.text }]}>
            This device: {Math.round(width)} × {Math.round(height)}
          </Text>
          <Text style={[type.small, { color: colors.textMuted }]}>
            {width > 600 ? "tablet width — 3 columns" : "phone width — 2 columns"}
          </Text>
        </View>

        <View style={[s.grid, { flexDirection: "row" }]}>
          {Array.from({ length: width > 600 ? 3 : 2 }, (_, index) => (
            <View key={index} style={[s.gridItem, { flex: 1 }]}>
              <Text style={s.pBoxText}>flex: 1</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="Spacing tokens instead of CSS variables"
        note="There is no :root and no var(). A tokens object imported by every StyleSheet is the whole mechanism — which makes it more load-bearing here than on the web."
      >
        <View style={{ gap: spacing.xs }}>
          {Object.entries(spacing).map(([key, value]) => (
            <Row key={key} gap={spacing.sm}>
              <Text style={[type.tiny, { color: colors.textFaint, width: 44 }]}>{key}</Text>
              <View
                style={{ width: value, height: 12, backgroundColor: colors.brand, borderRadius: 2 }}
              />
              <Text style={[type.tiny, { color: colors.textMuted }]}>{value}</Text>
            </Row>
          ))}
        </View>
        <Code>{`// theme/index.js — a 4pt scale
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// used everywhere
padding: spacing.lg`}</Code>
      </SectionCard>

      <SectionCard
        title="gap works, and it's newer than most tutorials"
        note="gap, rowGap and columnGap landed in React Native 0.71. Older code sets marginRight on every child except the last, which is why you'll still see that pattern."
      >
        <Code>{`// ✅ current
<View style={{ flexDirection: "row", gap: 8 }}>

// ❌ what pre-0.71 tutorials still show
<View style={{ flexDirection: "row" }}>
  {items.map((item, i) => (
    <Item style={{ marginRight: i === items.length - 1 ? 0 : 8 }} />
  ))}
</View>`}</Code>
      </SectionCard>

      <SectionCard title="Shadows are platform-specific">
        <Row gap={spacing.md}>
          <View style={[s.shadowDemo, s.shadowIos]}>
            <Text style={s.pBoxText}>iOS</Text>
          </View>
          <View style={[s.shadowDemo, s.shadowAndroid]}>
            <Text style={s.pBoxText}>Android</Text>
          </View>
        </Row>
        <Code>{`// iOS
shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.2,  shadowRadius: 6

// Android — ignores all four of those
elevation: 4          // also controls z-order

// theme/shadows.js wraps both in one helper
export function shadow(level = 1) {
  return Platform.select({ ios: {...}, android: { elevation: level * 2 } });
}`}</Code>
        <Text style={ui.note}>
          Only one of the two boxes above will actually show a shadow, depending on which platform
          you’re reading this on. That’s the point.
        </Text>
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  label: { ...type.tiny, color: colors.textFaint },

  playground: {
    minHeight: 130,
    backgroundColor: colors.sunk,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm
  },
  pBox: {
    minWidth: 48,
    minHeight: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  pBoxText: { ...type.small, fontWeight: "800", color: "#0d0f14" },

  dims: {
    backgroundColor: colors.sunk,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2
  },

  grid: { gap: spacing.sm },
  gridItem: {
    minHeight: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center"
  },

  shadowDemo: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  shadowIos: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8
  },
  shadowAndroid: { elevation: 8 }
});
