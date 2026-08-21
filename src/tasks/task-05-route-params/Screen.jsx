import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text, TextInput, StyleSheet } from "react-native";
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

export default function TaskScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const [id, setId] = useState("4");

  return (
    <Screen>
      <PageHeader
        number={5}
        title="Route Params"
        brief="Pass item IDs/data to details screens and safely handle missing params"
        lead="Pass the id, not the object. The second half of this task — handling a param that isn't there — is the half that gets skipped."
      />

      <SectionCard
        title="This screen's own params"
        note="Read live from useRoute. A screen opened from the task list has none, which is exactly the case worth designing for."
      >
        <KeyValue
          items={[
            ["route.name", route.name],
            ["route.params", JSON.stringify(route.params ?? null)],
            ["route.key", route.key]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Send an id to the deliverable's Details screen"
        note="Try a real one (1–100), then try 99999 and then a word. All three are handled, differently."
      >
        <TextInput
          value={id}
          onChangeText={setId}
          placeholder="Product id"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          style={[
            s.input,
            { backgroundColor: colors.sunk, borderColor: colors.border, color: colors.text }
          ]}
        />
        <Row>
          <Button
            label={`Open product ${id || "?"}`}
            size="sm"
            onPress={() =>
              navigation.navigate("App", {
                screen: "HomeTab",
                params: { screen: "Details", params: { id: Number(id) } }
              })
            }
          />
          <Button
            label="Open with no id"
            size="sm"
            variant="ghost"
            onPress={() =>
              navigation.navigate("App", {
                screen: "HomeTab",
                params: { screen: "Details", params: {} }
              })
            }
          />
          <Button
            label="Open with a word"
            size="sm"
            variant="ghost"
            onPress={() =>
              navigation.navigate("App", {
                screen: "HomeTab",
                params: { screen: "Details", params: { id: "banana" } }
              })
            }
          />
        </Row>
        <Text style={[type.small, { color: colors.textMuted }]}>
          The last two reach a screen that renders an explanation rather than crashing on{" "}
          <Text style={{ fontWeight: "700" }}>undefined</Text>.
        </Text>
      </SectionCard>

      <SectionCard
        title="Navigating into a nested navigator"
        note="Three levels deep needs the screen/params shape. Getting it wrong lands you on the tab's default screen with no error."
      >
        <Code>{`navigation.navigate("App", {          // the drawer screen
  screen: "HomeTab",                   // the tab
  params: {
    screen: "Details",                 // the stack screen
    params: { id: 4 }                  // the actual params
  }
});`}</Code>
      </SectionCard>

      <SectionCard
        title="Pass the id, not the object"
        note="The tempting shortcut is to pass the whole record. Three reasons not to."
      >
        <Code>{`navigation.navigate("Details", { product })     // ❌
navigation.navigate("Details", { id: product.id })  // ✅`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Params are serialised into navigation state, so they must be JSON-safe — no Dates, no
          functions, no class instances. They’re also persisted for state restoration, and a large
          object bloats that. And a passed-in copy goes stale the moment the record changes, while
          an id refetches.
        </Text>
      </SectionCard>

      <SectionCard
        title="Guard before you use"
        note="A param can be missing because of a bad deep link, a typo in a navigate call, or state restoration after the app was killed."
      >
        <Code>{`const rawId = route.params?.id;      // optional chaining — params itself
const id = Number(rawId);            // can be undefined
const valid = rawId !== undefined && !Number.isNaN(id);

if (!valid) return <ErrorState message="No usable product id was passed." />;

// Only fetch once the param is known good
const query = useApi(options => getProductById(id, options), [id], { enabled: valid });`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          A deep link always arrives as a <Text style={{ fontWeight: "700" }}>string</Text> —{" "}
          <Text style={{ fontWeight: "700" }}>day8://product/4</Text> gives you{" "}
          <Text style={{ fontWeight: "700" }}>"4"</Text>, not 4. Comparing it with === against a
          number silently fails.
        </Text>
      </SectionCard>

      <SectionCard title="Defaults, and updating params" note="Two smaller APIs worth knowing.">
        <Code>{`<Stack.Screen name="Details" component={Details} initialParams={{ id: 1 }} />

navigation.setParams({ sort: "price" });   // merges into the current params
// Useful for a filter that should survive a back-and-return, since
// params are restored with the screen.`}</Code>
        <Row>
          <Badge label="params are JSON only" tone="warning" />
          <Badge label="deep links are strings" tone="warning" />
        </Row>
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
