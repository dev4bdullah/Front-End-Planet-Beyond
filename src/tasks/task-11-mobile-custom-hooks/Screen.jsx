import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import {
  Screen,
  PageHeader,
  SectionCard,
  Code,
  Button,
  Row,
  Badge,
  KeyValue
} from "../../shared/ui";
import { useTheme, useApi, useAsyncStorage, useDebounce } from "../../hooks";
import { getProducts } from "../../services";
import { spacing, radius, type } from "../../theme";

export default function TaskScreen() {
  const { colors, mode, resolved, cycle, hydrated } = useTheme();

  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 450);
  const [note, setNote] = useAsyncStorage("day8.note", "");

  const query = useApi(
    options => getProducts({ search: debounced, limit: 3 }, options),
    [debounced],
    {
      enabled: debounced.trim().length > 0
    }
  );

  return (
    <Screen>
      <PageHeader
        number={11}
        title="Mobile Custom Hooks"
        brief="Create useApi, useAsyncStorage, useTheme, and useDebounce hooks"
        lead="Four hooks. Between them they remove about sixty lines from every data screen in this app."
      />

      <SectionCard title="All four, working at once">
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder="Type to search (debounced 450ms)"
          placeholderTextColor={colors.textFaint}
          style={[
            s.input,
            { backgroundColor: colors.sunk, borderColor: colors.border, color: colors.text }
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Row>
          <Badge label={`typing: ${term || "—"}`} />
          <Badge label={`debounced: ${debounced || "—"}`} tone="brand" />
          <Badge
            label={term !== debounced ? "waiting" : "settled"}
            tone={term !== debounced ? "warning" : "success"}
          />
        </Row>

        <View style={{ minHeight: 60 }}>
          {query.loading ? (
            <Text style={[type.small, { color: colors.textMuted }]}>Loading…</Text>
          ) : query.error ? (
            <Text style={[type.small, { color: colors.danger }]}>{query.error.message}</Text>
          ) : (
            (query.data?.products ?? []).map(item => (
              <Text key={item.id} style={[type.small, { color: colors.text }]} numberOfLines={1}>
                • {item.title}
              </Text>
            ))
          )}
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="A note — persisted with useAsyncStorage"
          placeholderTextColor={colors.textFaint}
          style={[
            s.input,
            { backgroundColor: colors.sunk, borderColor: colors.border, color: colors.text }
          ]}
        />

        <Row>
          <Button label={`theme: ${mode} → ${resolved}`} size="sm" onPress={cycle} />
          <Badge
            label={hydrated ? "storage hydrated" : "reading…"}
            tone={hydrated ? "success" : "warning"}
          />
        </Row>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Close the app entirely and reopen it — the note and the theme are still here.
        </Text>
      </SectionCard>

      <SectionCard title="What each one owns">
        <KeyValue
          items={[
            ["useApi", "loading, refreshing, error, data, retry, refresh, abort"],
            ["useAsyncStorage", "async read, hydrated flag, guarded write, reset"],
            ["useTheme", "three modes, system preference, persisted, context"],
            ["useDebounce", "one timer, cleared on every change"]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="useApi — five states, not three"
        note="The mobile-specific addition is `refreshing`, separate from `loading`, because a pull-to-refresh must not blank the screen."
      >
        <Code>{`const { data, loading, refreshing, error, retry, refresh } = useApi(fetcher, [deps]);

// The fetcher is an inline arrow with a new identity every render,
// so it lives in a ref rather than the dependency array — which would
// otherwise loop forever.
const fetcherRef = useRef(fetcher);
fetcherRef.current = fetcher;`}</Code>
      </SectionCard>

      <SectionCard
        title="useDebounce — the cleanup IS the mechanism"
        note="It matters more on a phone than the web: every skipped request is battery and mobile data the user is paying for."
      >
        <Code>{`useEffect(() => {
  const timer = setTimeout(() => setDebounced(value), delay);
  return () => clearTimeout(timer);     // delete this and it stops working
}, [value, delay]);`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Without the cleanup you don’t get a debounce — you get one delayed update per keystroke,
          all firing 450ms apart. Type in the box above and watch the two badges diverge and
          converge.
        </Text>
      </SectionCard>

      <SectionCard
        title="useTheme — three modes, not two"
        note="A phone already has a global light/dark preference. Ignoring it is a small rudeness, and 'system' is the honest default."
      >
        <Code>{`const system = useColorScheme();              // "light" | "dark" | null
const [mode] = useAsyncStorage("day8.theme", "system");

const resolved = mode === "system" ? (system ?? "dark") : mode;
const colors = palettes[resolved];`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Because the colours come from context, switching the theme reaches every screen without a
          single one importing a palette.
        </Text>
      </SectionCard>

      <SectionCard
        title="The rules"
        note="Same as the web, with one addition that only bites on mobile."
      >
        <Code>{`1. The name starts with "use", or React can't apply the rules of hooks.
2. A hook returns values, never JSX.
3. Extract when you've written the same effect twice, not in anticipation.
4. Mobile-specific: guard every setState behind a mounted check.
   A screen can be unmounted by a back gesture mid-request far more
   easily than a web page navigates away mid-fetch.`}</Code>
      </SectionCard>
    </Screen>
  );
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15
  }
});
