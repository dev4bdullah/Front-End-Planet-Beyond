import { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
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
import { useTheme } from "../../hooks";
import { useToast } from "../task-08-toast-alert-feedback/lib/ToastContext";
import { offerSettings, describe, STATUS } from "../task-01-permissions-overview/lib/permissions";
import { spacing, type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [permission, setPermission] = useState(null);
  const [coords, setCoords] = useState(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("Rawalpindi, PK");

  async function requestAndRead() {
    setBusy(true);

    try {
      // Is location even turned on at the device level? A granted permission
      // with location services off still fails, with a different message.
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        toast.warning("Location services are turned off for the whole device.");
        return;
      }

      const response = await Location.requestForegroundPermissionsAsync();
      const state = describe(response);
      setPermission(state);

      if (!state.granted) {
        if (!state.canAskAgain) offerSettings({ feature: "Location" });
        else toast.info("No problem — the screen works without it.");
        return;
      }

      /* Balanced accuracy, not High. High spins up GPS, takes seconds and
         costs real battery. For "roughly where am I", it's the wrong trade. */
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      setCoords(position.coords);
      toast.success("Location read.");
    } catch (error) {
      toast.error(error.message ?? "Could not read the location.");
    } finally {
      setBusy(false);
    }
  }

  const status = permission ? (STATUS[permission.status] ?? STATUS.undetermined) : null;

  return (
    <Screen>
      <PageHeader
        number={4}
        title="Location Permission Optional"
        brief="Request location permission and show coordinates only if permission is granted"
        lead="The word in the title is 'optional'. This screen is fully usable if you say no — that's the whole exercise."
      />

      <SectionCard
        title="Your location"
        note="Nothing is requested until you press the button, and refusing leaves the screen working."
      >
        <Row>
          <Button
            label={coords ? "Read again" : "Use my location"}
            onPress={requestAndRead}
            disabled={busy}
          />
          {status ? <Badge label={status.label} tone={status.tone} /> : <Badge label="not asked" />}
        </Row>

        <View style={{ minHeight: 92, justifyContent: "center" }}>
          {busy ? (
            <ActivityIndicator color={colors.brand} />
          ) : coords ? (
            <KeyValue
              items={[
                ["Latitude", coords.latitude.toFixed(5)],
                ["Longitude", coords.longitude.toFixed(5)],
                ["Accuracy", `±${Math.round(coords.accuracy ?? 0)} m`],
                ["Altitude", coords.altitude ? `${Math.round(coords.altitude)} m` : "not available"]
              ]}
            />
          ) : (
            /* The fallback is a real feature, not an apology. Someone who
               declines still needs to say where they are. */
            <View style={{ gap: spacing.xs }}>
              <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>
                Using your saved location
              </Text>
              <Text style={[type.small, { color: colors.textMuted }]}>
                {manual} — set manually. Location access would fill this in automatically, but it
                isn’t required.
              </Text>
              <Row>
                {["Rawalpindi, PK", "Lahore, PK", "Karachi, PK"].map(city => (
                  <Button
                    key={city}
                    label={city.split(",")[0]}
                    size="sm"
                    variant={manual === city ? "primary" : "ghost"}
                    onPress={() => setManual(city)}
                  />
                ))}
              </Row>
            </View>
          )}
        </View>
      </SectionCard>

      <SectionCard
        title="Optional means the app works without it"
        note="The difference between a feature that degrades and a screen that dead-ends."
      >
        <Code>{`// ❌ a dead end
if (!granted) return <Text>Location permission required</Text>;

// ✅ a different route to the same goal
{coords
  ? <Coordinates coords={coords} />
  : <ManualLocationPicker value={manual} onChange={setManual} />}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Roughly a fifth of users decline location on first ask. A screen that stops working for
          them is a screen that stops working for a fifth of your users.
        </Text>
      </SectionCard>

      <SectionCard
        title="Three checks, not one"
        note="A granted permission is not enough on its own."
      >
        <Code>{`// 1. is location on for the whole DEVICE?
const enabled = await Location.hasServicesEnabledAsync();

// 2. has this app been granted permission?
const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();

// 3. can we actually get a fix? (indoors, this can just time out)
const position = await Location.getCurrentPositionAsync({ accuracy: Accuracy.Balanced });`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Each fails differently and each needs its own message. “Location unavailable” for all
          three tells the user nothing about what to do.
        </Text>
      </SectionCard>

      <SectionCard
        title="Accuracy is a battery decision"
        note="Accuracy.Highest keeps GPS running. For most features it's the wrong default."
      >
        <Code>{`Accuracy.Lowest    ~3km   cell tower — near-free
Accuracy.Low       ~1km
Accuracy.Balanced  ~100m  wifi + cell — right for "which city"
Accuracy.High      ~10m   GPS — for navigation
Accuracy.Highest   ~best  GPS at full rate — drains the battery visibly`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          This screen uses Balanced. Showing a city name to five decimal places of GPS precision
          would be spending the user’s battery on nothing.
        </Text>
      </SectionCard>

      <SectionCard
        title="Foreground and background are different permissions"
        note="And the second one is a serious commitment."
      >
        <Code>{`requestForegroundPermissionsAsync()   // while the app is open
requestBackgroundPermissionsAsync()   // always, even when closed

// Background location requires a written justification in App Review,
// shows the user a persistent indicator, and is rejected outright if
// the feature doesn't genuinely need it. Ask for foreground unless
// you're building navigation or geofencing.`}</Code>
      </SectionCard>

      <SectionCard
        title="Never ask on mount"
        note="A location prompt before the user has done anything is the fastest way to a permanent denial."
      >
        <Code>{`// ❌
useEffect(() => { requestForegroundPermissionsAsync(); }, []);

// ✅ tied to an action the user took, with the reason already visible
<Button label="Use my location" onPress={requestAndRead} />`}</Code>
      </SectionCard>
    </Screen>
  );
}
