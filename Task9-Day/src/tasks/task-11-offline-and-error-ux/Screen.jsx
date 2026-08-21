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
  KeyValue,
  ErrorState,
  SkeletonRow
} from "../../shared/ui";
import { useTheme, useNetwork, useApi } from "../../hooks";
import { getProducts, getBroken } from "../../services";
import { spacing, radius, type } from "../../theme";

const MODES = {
  ok: { label: "works", call: options => getProducts({ limit: 3 }, options) },
  notFound: { label: "404", call: options => getBroken(options) },
  timeout: {
    label: "timeout",
    call: options => getProducts({ limit: 3 }, { ...options, timeout: 1 })
  },
  dead: {
    label: "no host",
    call: () => fetch("https://no-such-host-9x7q.dev/x").then(r => r.json())
  }
};

export default function TaskScreen() {
  const { colors } = useTheme();
  const network = useNetwork();
  const [mode, setMode] = useState("ok");

  const query = useApi(options => MODES[mode].call(options), [mode]);
  const items = query.data?.products ?? [];

  return (
    <Screen>
      <PageHeader
        number={11}
        title="Offline & Error UX"
        brief="Show offline/error fallback, retry actions, and safe UI when API/network fails"
        lead="A phone loses signal constantly. Offline isn't an error state on mobile — it's a normal one."
      />

      <SectionCard
        title="Live connectivity"
        note="Turn on airplane mode and watch this change. Then try a hotel-wifi situation: connected, but no internet."
      >
        <Row>
          <Badge
            label={network.online ? "online" : "offline"}
            tone={network.online ? "success" : "danger"}
          />
          <Badge label={`type: ${network.type}`} />
          <Badge label={`isConnected: ${network.isConnected}`} />
          <Badge label={`reachable: ${network.isInternetReachable}`} />
        </Row>

        {!network.online ? (
          <View
            style={{
              backgroundColor: colors.sunk,
              borderColor: colors.danger,
              borderWidth: 1,
              borderRadius: radius.md,
              padding: spacing.md,
              gap: 2
            }}
            accessibilityLiveRegion="polite"
          >
            <Text style={[type.small, { color: colors.danger, fontWeight: "700" }]}>
              You’re offline
            </Text>
            <Text style={[type.small, { color: colors.textMuted }]}>
              Showing what was already loaded. Anything you change is kept and will sync when the
              connection returns.
            </Text>
          </View>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Two different questions"
        note="This distinction is the whole reason NetInfo has two flags, and checking only the first is why apps claim to be online while every request times out."
      >
        <Code>{`isConnected           the device is attached to a network
isInternetReachable   that network can actually reach the internet

// They differ constantly:
//   hotel wifi behind a captive portal → connected, not reachable
//   a train tunnel                     → connected to a cell, not reachable
//   full bars, no data allowance       → connected, not reachable

const online = isConnected && isInternetReachable !== false;
//                                       ^^^^^^^^ null means "still
//                                       checking" — treating null as
//                                       false flashes an offline banner
//                                       on every launch.`}</Code>
      </SectionCard>

      <SectionCard
        title="Force each failure"
        note="Four different problems that all look like 'it didn't work' if you don't distinguish them."
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

        <View style={{ minHeight: 150, justifyContent: "center" }}>
          {query.loading ? (
            <View style={{ gap: spacing.sm }}>
              {Array.from({ length: 3 }, (_, index) => (
                <SkeletonRow key={index} height={44} />
              ))}
            </View>
          ) : query.error ? (
            <ErrorState error={query.error} onRetry={query.retry} />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {items.map(item => (
                <Text key={item.id} style={[type.small, { color: colors.text }]} numberOfLines={1}>
                  • {item.title}
                </Text>
              ))}
            </View>
          )}
        </View>
      </SectionCard>

      <SectionCard
        title="Say which problem it is"
        note="'Something went wrong' tells the user nothing about whether to wait, retry, or give up."
      >
        <Code>{`{error.kind === "network"  && "You're offline. Check your connection."}
{error.kind === "timeout"  && "That took too long. The connection may be slow."}
{error.status === 404      && "That doesn't exist any more."}
{error.status >= 500       && "The server had a problem. Not your fault — try again shortly."}

// Each one implies a different action. A 404 should not offer a
// retry button, because retrying will produce the same 404.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The <Text style={{ fontWeight: "700" }}>kind</Text> field comes from the service layer,
          which is why no screen has to parse an error message string.
        </Text>
      </SectionCard>

      <SectionCard
        title="Stale data beats no data"
        note="If you have something from five minutes ago, show it. A blank screen with an error is strictly worse."
      >
        <Code>{`// ❌ the error replaces everything the user had
if (error) return <ErrorState />;

// ✅ keep the content, put the problem above it
{error && <OfflineBanner onRetry={retry} />}
<List items={cachedItems} />

// useApi does exactly this for a REFRESH: a failed pull-to-refresh
// keeps the old rows and reports the error separately.`}</Code>
      </SectionCard>

      <SectionCard
        title="A retry has to be reachable"
        note="An error message with no way out leaves force-quitting as the user's only option."
      >
        <Code>{`<ErrorState error={error} onRetry={retry} />

// And don't auto-retry silently in a loop — on a metered connection
// that's the user's money. Retry on demand, or with backoff and a
// visible attempt count.`}</Code>
      </SectionCard>

      <SectionCard
        title="Offline-first, briefly"
        note="The full version is beyond one task, but the shape is worth knowing."
      >
        <Code>{`1. Read from a local cache first, render immediately.
2. Fetch in the background; update the cache and the UI when it lands.
3. Queue writes made offline; replay them when connectivity returns.
4. Show what's pending, so the user knows it hasn't been sent yet.

// Steps 1–2 are what TanStack Query gives you almost for free.
// Steps 3–4 are the genuinely hard part, and where most apps stop.`}</Code>

        <KeyValue
          items={[
            ["This app does", "1 and 2, partially — cached data survives a failed refresh"],
            ["It doesn't do", "a write queue; there are no writes to queue"]
          ]}
        />
      </SectionCard>
    </Screen>
  );
}
