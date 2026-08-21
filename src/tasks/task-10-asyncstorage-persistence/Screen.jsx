import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "react-native";
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
import { useTheme, useAsyncStorage, useFavorites } from "../../hooks";
import { type } from "../../theme";

export default function TaskScreen() {
  const { colors, mode, cycle } = useTheme();
  const { count } = useFavorites();

  const [onboarded, setOnboarded, { hydrated, reset }] = useAsyncStorage("day8.onboarded", false);
  const [keys, setKeys] = useState([]);
  const [sizes, setSizes] = useState({});

  const inspect = async () => {
    const all = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(all);
    setKeys(all);
    setSizes(Object.fromEntries(entries.map(([key, value]) => [key, (value ?? "").length])));
  };

  /* setState happens after an await, inside the async callback — not
     synchronously in the effect body, which would be a cascading render.
     The `active` flag stops a late read writing to an unmounted screen. */
  useEffect(() => {
    let active = true;

    (async () => {
      const all = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(all);
      if (!active) return;
      setKeys(all);
      setSizes(Object.fromEntries(entries.map(([key, value]) => [key, (value ?? "").length])));
    })();

    return () => {
      active = false;
    };
  }, [onboarded, mode, count]);

  return (
    <Screen>
      <PageHeader
        number={10}
        title="AsyncStorage Persistence"
        brief="Save theme, onboarding flag, favorites, and small profile preferences in AsyncStorage"
        lead="localStorage's asynchronous cousin. That one word changes how every consumer has to be written."
      />

      <SectionCard
        title="What this app stores"
        note="Read live with getAllKeys and multiGet, so this is the actual contents rather than a description of it."
      >
        <KeyValue
          items={
            keys.length
              ? keys.map(key => [key, `${sizes[key]} chars`])
              : [["(empty)", "nothing stored yet"]]
          }
        />
        <Row>
          <Button label="Re-read storage" size="sm" variant="ghost" onPress={inspect} />
          <Button label={`theme: ${mode}`} size="sm" onPress={cycle} />
          <Button
            label={onboarded ? "Mark not onboarded" : "Mark onboarded"}
            size="sm"
            variant="ghost"
            onPress={() => setOnboarded(value => !value)}
          />
          <Button label="Reset the flag" size="sm" variant="ghost" onPress={reset} />
        </Row>
        <Badge label={hydrated ? "hydrated" : "reading…"} tone={hydrated ? "success" : "warning"} />
      </SectionCard>

      <SectionCard
        title="The asynchronous part is the whole difficulty"
        note="There is no way to read AsyncStorage during the first render. Every consumer needs a hydrated flag."
      >
        <Code>{`// Web — synchronous, so the first render can already be correct
const [theme] = useState(() => localStorage.getItem("theme") ?? "dark");

// React Native — the first render CANNOT know
const [theme, setTheme] = useState("dark");   // the default
useEffect(() => {
  AsyncStorage.getItem("theme").then(saved => saved && setTheme(JSON.parse(saved)));
}, []);

// which is why the app briefly shows the default before swapping —
// the "flash of wrong theme" on launch.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The fix is to hold the splash screen until{" "}
          <Text style={{ fontWeight: "700" }}>hydrated</Text> is true, rather than rendering the
          wrong thing and correcting it.
        </Text>
      </SectionCard>

      <SectionCard
        title="Don't write before the read finishes"
        note="This is the bug that makes persistence look like it works sometimes."
      >
        <Code>{`useEffect(() => {
  if (!hydrated) return;        // ← without this line, the DEFAULT value
                                //   overwrites the stored one on every launch
  AsyncStorage.setItem(key, JSON.stringify(value));
}, [key, value, hydrated]);`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Without the guard: mount writes the default, the read then returns that default, and the
          real value is gone. It looks like the write failed, when actually it succeeded — with the
          wrong data.
        </Text>
      </SectionCard>

      <SectionCard
        title="Strings only, and it can throw"
        note="Same as localStorage on the first count; unlike localStorage, every call is a promise that can reject."
      >
        <Code>{`await AsyncStorage.setItem(key, JSON.stringify(value));
const raw = await AsyncStorage.getItem(key);
const value = raw === null ? fallback : JSON.parse(raw);

// getItem returns null for a missing key — not undefined. Checking
// \`if (!raw)\` also swallows a legitimately stored "" or false.

try   { … }
catch (error) { console.warn(…); }   // corrupt JSON shouldn't crash launch`}</Code>
      </SectionCard>

      <SectionCard
        title="The batch APIs"
        note="Reading ten keys with ten awaits is ten round trips to native. multiGet is one."
      >
        <Code>{`await AsyncStorage.multiGet(["theme", "favorites", "prefs"]);
await AsyncStorage.multiSet([["a", "1"], ["b", "2"]]);
await AsyncStorage.multiRemove(["a", "b"]);
await AsyncStorage.getAllKeys();
await AsyncStorage.clear();        // everything — rarely what you want`}</Code>
      </SectionCard>

      <SectionCard
        title="What does NOT belong in AsyncStorage"
        note="It's unencrypted, and it has a practical size limit."
      >
        <Code>{`// ❌ auth tokens, passwords, anything sensitive
//    → expo-secure-store (Keychain / Keystore)

// ❌ large datasets, images, offline caches
//    → expo-sqlite, or a file in expo-file-system
//    Android's default AsyncStorage has a ~6MB total limit.

// ✅ a theme, a flag, a list of ids, a few preferences`}</Code>

        <Row>
          <Badge label="unencrypted" tone="danger" />
          <Badge label="~6MB on Android" tone="warning" />
          <Badge label="survives app restart" tone="success" />
          <Badge label="cleared on uninstall" />
        </Row>
      </SectionCard>
    </Screen>
  );
}
