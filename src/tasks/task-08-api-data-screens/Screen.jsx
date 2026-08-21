import { useState } from "react";
import { View, Text } from "react-native";
import {
  Screen,
  PageHeader,
  SectionCard,
  Code,
  Button,
  Row,
  Badge,
  ErrorState,
  EmptyState,
  SkeletonRow
} from "../../shared/ui";
import { useTheme, useApi } from "../../hooks";
import { getProducts, getBroken } from "../../services";
import { spacing, type } from "../../theme";
import { formatPrice } from "../../data";

const MODES = {
  success: { label: "success", call: options => getProducts({ limit: 4 }, options) },
  empty: { label: "empty", call: options => getProducts({ search: "zzzzzqqq" }, options) },
  error: { label: "error", call: options => getBroken(options) },
  slow: { label: "slow", call: options => getProducts({ limit: 4 }, { ...options, timeout: 1 }) }
};

export default function TaskScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState("success");

  const query = useApi(options => MODES[mode].call(options), [mode]);
  const items = query.data?.products ?? [];

  return (
    <Screen>
      <PageHeader
        number={8}
        title="API Data Screens"
        brief="Fetch list and detail data with loading, success, error, empty, and refresh states"
        lead="Five states, not two. The three people skip are the three users actually hit."
      />

      <SectionCard
        title="Force each state"
        note="The same screen, the same hook — only the request changes."
      >
        <Row>
          {Object.entries(MODES).map(([key, value]) => (
            <Button
              key={key}
              label={value.label}
              size="sm"
              variant={mode === key ? "primary" : "ghost"}
              onPress={() => setMode(key)}
            />
          ))}
        </Row>

        <View style={{ minHeight: 210, justifyContent: "center" }}>
          {query.loading ? (
            <View style={{ gap: spacing.sm }}>
              {Array.from({ length: 4 }, (_, index) => (
                <SkeletonRow key={index} height={52} />
              ))}
            </View>
          ) : query.error ? (
            <ErrorState error={query.error} onRetry={query.retry} />
          ) : items.length === 0 ? (
            <EmptyState
              title="No results"
              message="The request succeeded and returned nothing. That's different from an error."
            />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {items.map(item => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: colors.sunk,
                    borderRadius: 10,
                    padding: spacing.md
                  }}
                >
                  <Text style={[type.small, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[type.small, { color: colors.textMuted }]}>
                    {formatPrice(item.price)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Row>
          <Badge label={`loading: ${query.loading}`} tone={query.loading ? "warning" : "neutral"} />
          <Badge
            label={`error: ${Boolean(query.error)}`}
            tone={query.error ? "danger" : "neutral"}
          />
          <Badge label={`rows: ${items.length}`} tone="brand" />
        </Row>
      </SectionCard>

      <SectionCard
        title="Empty is not an error"
        note="Conflating them is the most common data-screen bug. A search with no matches worked perfectly; it just found nothing."
      >
        <Code>{`if (loading)          return <Skeletons />;
if (error)            return <ErrorState error={error} onRetry={retry} />;
if (!items.length)    return <EmptyState … />;
return <List items={items} />;

// Order matters. Checking !items.length first shows an empty state
// during loading, because the array is empty then too.`}</Code>
      </SectionCard>

      <SectionCard
        title="Skeletons, not a spinner"
        note="A skeleton shaped like the content tells the user what's coming and how much. A centred spinner tells them only that something is happening."
      >
        <Code>{`{loading && Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)}

// Match the real row height. A skeleton that's the wrong size causes
// a visible jump when the data lands, which is worse than no skeleton.`}</Code>
      </SectionCard>

      <SectionCard
        title="An error needs a way out"
        note="An error message with no button leaves the user's only option as force-quitting the app."
      >
        <Code>{`<ErrorState error={error} onRetry={retry} />

// And the message should say which problem it is:
{error.kind === "network" ? "You're offline" : "Something went wrong"}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Press <Text style={{ fontWeight: "700" }}>error</Text> then{" "}
          <Text style={{ fontWeight: "700" }}>slow</Text> above — one shows a 404 badge, the other a
          timeout with no status.
        </Text>
      </SectionCard>

      <SectionCard
        title="Detail screens have one extra state"
        note="A list can render an empty array. A detail screen with no record has nothing to show at all."
      >
        <Code>{`// task 5's guard, before the fetch even starts
const valid = rawId !== undefined && !Number.isNaN(Number(rawId));
const query = useApi(fn, [id], { enabled: valid });

// enabled:false means the hook doesn't fire and doesn't sit in loading
// forever waiting for a request that was never made.`}</Code>
      </SectionCard>
    </Screen>
  );
}
