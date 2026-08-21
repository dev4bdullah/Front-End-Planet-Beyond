import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from "react-native";
import { PageHeader, SectionCard, Code, Badge, Row, styles as ui } from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";
import { products } from "../../data";

export default function Screen() {
  const [text, setText] = useState("");
  const [pressCount, setPressCount] = useState(0);
  const [touchCount, setTouchCount] = useState(0);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={4}
        title="Core Components"
        brief="Build screens using View, Text, Image, ScrollView, FlatList, Pressable, TouchableOpacity, and TextInput"
        lead="Eight components. There is no div, no span, no p — and Text is not optional."
      />

      <SectionCard
        title="View — the only container"
        note="A View is a flexbox container and nothing else. It has no default styling, cannot contain raw text, and does not scroll."
      >
        <View style={s.demoRow}>
          <View style={[s.box, { backgroundColor: colors.brand }]} />
          <View style={[s.box, { backgroundColor: colors.success }]} />
          <View style={[s.box, { backgroundColor: colors.warning }]} />
        </View>
        <Code>{`<View style={{ flexDirection: "row", gap: 8 }}>
  <View style={{ width: 44, height: 44 }} />
</View>`}</Code>
      </SectionCard>

      <SectionCard
        title="Text — every string needs one"
        note="This is the rule that catches everyone. A bare string inside a View is a runtime error, not a warning: 'Text strings must be rendered within a <Text> component'."
      >
        <Text style={[type.title, { color: colors.text }]}>Title</Text>
        <Text style={[type.body, { color: colors.textMuted }]}>Body copy, muted.</Text>
        <Text style={[type.small, { color: colors.textFaint }]} numberOfLines={1}>
          numberOfLines=1 truncates this very long line rather than wrapping it forever and pushing
          the layout apart
        </Text>
        <Code>{`<View>Hello</View>            // ❌ runtime error
<View><Text>Hello</Text></View>  // ✅

// Text nests, and style inherits — unlike View
<Text style={{ color: "#fff" }}>
  Normal <Text style={{ fontWeight: "700" }}>bold</Text> normal
</Text>`}</Code>
        <Text style={ui.note}>
          Text is also the only component where style inherits to children. A colour set on a View
          does not reach the Text inside it.
        </Text>
      </SectionCard>

      <SectionCard
        title="Pressable vs TouchableOpacity"
        note="Pressable is the modern one and what new code should use. TouchableOpacity still appears everywhere in older tutorials, which is why both are here."
      >
        <Row gap={spacing.sm}>
          <Pressable
            onPress={() => setPressCount(count => count + 1)}
            android_ripple={{ color: colors.brandSoft }}
            style={({ pressed }) => [s.pressBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.pressLabel}>Pressable · {pressCount}</Text>
          </Pressable>

          <TouchableOpacity
            onPress={() => setTouchCount(count => count + 1)}
            activeOpacity={0.6}
            style={s.pressBtn}
          >
            <Text style={s.pressLabel}>Touchable · {touchCount}</Text>
          </TouchableOpacity>
        </Row>

        <Code>{`// Pressable — style is a function of press state
<Pressable
  onPress={fn}
  android_ripple={{ color: "#232045" }}   // native Android feedback
  hitSlop={8}                              // bigger touch target, same layout
  style={({ pressed }) => [base, pressed && { opacity: 0.7 }]}
/>

// TouchableOpacity — only fades, no press state to style with
<TouchableOpacity onPress={fn} activeOpacity={0.6} />`}</Code>
        <Text style={ui.note}>
          Pressable also gives you onLongPress, onPressIn and onPressOut, and lets you build a
          platform-correct ripple on Android and an opacity fade on iOS from one component.
        </Text>
      </SectionCard>

      <SectionCard
        title="TextInput"
        note="No onChange — it's onChangeText, and it hands you the string directly rather than an event."
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type something"
          placeholderTextColor={colors.textFaint}
          style={s.input}
        />
        <Text style={ui.note}>{text.length} characters</Text>
        <Code>{`<TextInput
  value={text}
  onChangeText={setText}          // not onChange, and no event object
  placeholder="Type something"
  placeholderTextColor="#6b7385"  // a separate prop — CSS has no equivalent
  keyboardType="email-address"
  autoCapitalize="none"
/>`}</Code>
      </SectionCard>

      <SectionCard
        title="ScrollView vs FlatList"
        note="The decision that matters most for performance. ScrollView renders every child immediately; FlatList only renders what fits on screen."
      >
        <FlatList
          horizontal
          data={products.slice(0, 6)}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <View style={s.miniCard}>
              <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              <Text style={s.miniName} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          )}
        />
        <Code>{`ScrollView   → a settings page, a form, a detail screen
                (a known, small number of children)

FlatList     → any list that could grow
                (renders a window, recycles the rest)

// ❌ 500 products in a ScrollView = 500 mounted views
// ✅ 500 products in a FlatList  = about 12 mounted views`}</Code>
        <Row>
          <Badge label="task 9 covers FlatList properly" tone="brand" />
        </Row>
      </SectionCard>

      <SectionCard title="Image">
        <Row gap={spacing.md}>
          <Image
            source={{ uri: "https://picsum.photos/seed/rn-core/120/120" }}
            style={s.thumb}
            resizeMode="cover"
          />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text style={[type.small, { color: colors.textMuted }]}>
              A remote image needs an explicit width and height — unlike the web, RN cannot know the
              size before it downloads.
            </Text>
            <Badge label="task 8 covers this" tone="brand" />
          </View>
        </Row>
      </SectionCard>

      <SectionCard title="The web-to-native map">
        <View style={{ gap: spacing.xs }}>
          {[
            ["div", "View"],
            ["span / p / h1", "Text"],
            ["img", "Image"],
            ["button", "Pressable"],
            ["input", "TextInput"],
            ["ul with overflow", "FlatList"],
            ["a", "Pressable + navigation"],
            ["form", "no equivalent — you call the handler yourself"]
          ].map(([web, native]) => (
            <Row key={web} gap={spacing.sm}>
              <Text style={[type.small, { color: colors.textFaint, width: 110 }]}>{web}</Text>
              <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>{native}</Text>
            </Row>
          ))}
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  demoRow: { flexDirection: "row", gap: spacing.sm },
  box: { width: 44, height: 44, borderRadius: radius.sm },

  pressBtn: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    overflow: "hidden"
  },
  pressLabel: { ...type.small, fontWeight: "700", color: "#fff" },

  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.sunk,
    ...type.body
  },

  miniCard: {
    width: 104,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  miniName: { ...type.tiny, color: colors.textMuted, fontWeight: "600" },

  thumb: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.sunk }
});
