import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { Text, Pressable, StyleSheet } from "react-native";
import {
  Screen,
  PageHeader,
  SectionCard,
  Code,
  Button,
  Row,
  KeyValue,
  Badge
} from "../../shared/ui";
import { useTheme } from "../../hooks";
import { spacing, radius, type } from "../../theme";

const ROUTES = [
  ["/home", "The catalogue"],
  ["/product/4", "A product, by id"],
  ["/search", "The search tab"],
  ["/favorites", "Saved items"],
  ["/settings", "A drawer destination"]
];

export default function TaskScreen() {
  const { colors } = useTheme();
  const [initialUrl, setInitialUrl] = useState(null);
  const [lastUrl, setLastUrl] = useState(null);

  useEffect(() => {
    // The URL that launched the app from cold, if any
    Linking.getInitialURL().then(url => setInitialUrl(url ?? "none"));

    // And any link received while the app was already running
    const subscription = Linking.addEventListener("url", event => setLastUrl(event.url));
    return () => subscription.remove();
  }, []);

  return (
    <Screen>
      <PageHeader
        number={6}
        title="Deep Linking"
        brief="Configure a simple deep link that opens a selected details screen"
        lead="A URL that opens a specific screen — including from a cold start, which is the case that needs the extra work."
      />

      <SectionCard
        title="This app's URLs"
        note="Tap one to open it. In Expo Go the scheme is an exp:// URL; in a real build it's day8://."
      >
        {ROUTES.map(([path, label]) => (
          <Pressable
            key={path}
            onPress={() => Linking.openURL(Linking.createURL(path))}
            style={[s.link, { backgroundColor: colors.sunk, borderColor: colors.border }]}
            accessibilityRole="link"
          >
            <Text style={[type.small, { color: colors.brand, fontWeight: "700" }]}>{path}</Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>{label}</Text>
          </Pressable>
        ))}

        <KeyValue
          items={[
            ["Scheme prefix", Linking.createURL("/")],
            ["Launched from", initialUrl ?? "checking…"],
            ["Last link received", lastUrl ?? "none yet"]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="The config mirrors the navigator tree"
        note="Exactly. A mismatch produces no error — the link just opens the default screen, which is a confusing way to fail."
      >
        <Code>{`export const linking = {
  prefixes: [Linking.createURL("/"), "day8://", "https://day8.example.com"],
  config: {
    screens: {
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: "home",
              Details: "product/:id"      // day8://product/4
            }
          },
          SearchTab: "search",
          FavoritesTab: "favorites"
        }
      },
      Settings: "settings",
      NotFound: "*"                       // catch anything unmatched
    }
  }
};

<NavigationContainer linking={linking}>`}</Code>
      </SectionCard>

      <SectionCard
        title="Two kinds of link, and why the second is harder"
        note="Custom schemes work immediately. Universal links need a file on a server you control."
      >
        <Code>{`day8://product/4
// A custom scheme. One line in app.json, works instantly.
// Downside: does nothing if the app isn't installed, and anyone
// can register the same scheme.

https://day8.example.com/product/4
// A universal link (iOS) / app link (Android). Opens the app if
// installed, the website if not — which is what you actually want
// from a link in an email.
// Requires:
//   iOS:     /.well-known/apple-app-site-association on the domain
//   Android: /.well-known/assetlinks.json, plus autoVerify in the manifest`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          This project declares both in <Text style={{ fontWeight: "700" }}>app.json</Text>. The
          scheme works; the universal link points at a domain that doesn’t exist, so it’s the shape
          rather than a working example.
        </Text>
      </SectionCard>

      <SectionCard
        title="Cold start vs warm"
        note="Two different APIs, and handling only one is the usual bug — the link works when the app is open and does nothing when it isn't."
      >
        <Code>{`// App already running
Linking.addEventListener("url", ({ url }) => handle(url));

// App launched BY the link
const url = await Linking.getInitialURL();

// NavigationContainer's linking prop handles both for you.
// You only need these directly for analytics, or for links that
// aren't routes.`}</Code>
      </SectionCard>

      <SectionCard title="Testing it" note="You don't need to publish anything to try a deep link.">
        <Code>{`# Android
adb shell am start -W -a android.intent.action.VIEW -d "day8://product/4"

# iOS simulator
xcrun simctl openurl booted "day8://product/4"

# Expo Go — the scheme differs, so build the URL rather than typing it
npx uri-scheme open "exp://127.0.0.1:8081/--/product/4" --ios`}</Code>

        <Row>
          <Button
            label="Open product 4"
            size="sm"
            onPress={() => Linking.openURL(Linking.createURL("/product/4"))}
          />
          <Button
            label="Open a bad URL"
            size="sm"
            variant="ghost"
            onPress={() => Linking.openURL(Linking.createURL("/nope/nowhere"))}
          />
        </Row>
        <Badge label="the bad URL lands on NotFound, by design" tone="warning" />
      </SectionCard>

      <SectionCard
        title="Params from a URL are always strings"
        note="Same trap as task 5, and deep links are where it actually bites."
      >
        <Code>{`day8://product/4   →   route.params.id === "4"    // a string

const id = Number(route.params?.id);
if (Number.isNaN(id)) return <NotFound />;`}</Code>
      </SectionCard>
    </Screen>
  );
}

const s = StyleSheet.create({
  link: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2
  }
});
