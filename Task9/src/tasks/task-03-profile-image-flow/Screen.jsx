import { useState } from "react";
import { View, Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Screen, PageHeader, SectionCard, Code, Button, Row, Badge } from "../../shared/ui";
import { useTheme, useAsyncStorage } from "../../hooks";
import { useToast } from "../task-08-toast-alert-feedback/lib/ToastContext";
import BottomSheet from "../task-09-modal-bottom-sheet/lib/BottomSheet";
import { offerSettings } from "../task-01-permissions-overview/lib/permissions";
import { spacing, type } from "../../theme";

/* Persisting a picker URI directly does not survive a restart: the picker
   hands back a path in a cache directory the OS is free to clear. Copying the
   file into documentDirectory is what makes it durable. */
const PROFILE_DIR = `${FileSystem.documentDirectory ?? ""}profile/`;

export default function TaskScreen() {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [profile, setProfile, { hydrated }] = useAsyncStorage("day9.profile", {
    uri: null,
    savedAt: null
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  async function persist(sourceUri) {
    // Make sure the directory exists — writing into a missing one throws
    const info = await FileSystem.getInfoAsync(PROFILE_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(PROFILE_DIR, { intermediates: true });

    /* A new filename each time. Overwriting the same path means the Image
       component keeps showing the cached old picture, because the URI didn't
       change — a genuinely baffling bug the first time you hit it. */
    const target = `${PROFILE_DIR}avatar-${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: sourceUri, to: target });

    // Clean up the previous one rather than accumulating files forever
    if (profile.uri) await FileSystem.deleteAsync(profile.uri, { idempotent: true });

    return target;
  }

  async function choose(source) {
    setSheetOpen(false);
    setBusy(true);

    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        if (!permission.canAskAgain)
          offerSettings({ feature: source === "camera" ? "Camera" : "Photo library" });
        else toast.warning("Permission declined.");
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8
            });

      if (result.canceled) return;

      const uri = await persist(result.assets[0].uri);
      setProfile({ uri, savedAt: new Date().toISOString() });
      setMissing(false);
      toast.success("Profile picture saved.");
    } catch (error) {
      toast.error(error.message ?? "Could not save the image.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setSheetOpen(false);

    if (profile.uri) {
      // idempotent, so a missing file isn't an error
      await FileSystem.deleteAsync(profile.uri, { idempotent: true }).catch(() => {});
    }

    setProfile({ uri: null, savedAt: null });
    setMissing(false);
    toast.info("Profile picture removed.");
  }

  const showPlaceholder = !profile.uri || missing;

  return (
    <Screen>
      <PageHeader
        number={3}
        title="Profile Image Flow"
        brief="Preview selected image, allow replace/remove, and persist selected profile data locally"
        lead="Picking the image was task 2. Keeping it after the app restarts is a different problem entirely."
      />

      <SectionCard
        title="The flow"
        note="Tap the avatar. Choose, replace or remove — then force-quit the app and come back."
      >
        <View style={{ alignItems: "center", gap: spacing.md }}>
          <Pressable
            onPress={() => setSheetOpen(true)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={profile.uri ? "Change profile picture" : "Add a profile picture"}
            style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          >
            <View style={[st.avatar, { backgroundColor: colors.sunk, borderColor: colors.border }]}>
              {busy || !hydrated ? (
                <ActivityIndicator color={colors.brand} />
              ) : showPlaceholder ? (
                <Text style={{ fontSize: 34 }}>👤</Text>
              ) : (
                <Image
                  source={{ uri: profile.uri }}
                  style={{ width: 116, height: 116, borderRadius: 58 }}
                  /* The stored file can vanish — a user clearing app storage,
                     an OS cleanup, a restore from backup. Handle it. */
                  onError={() => setMissing(true)}
                  accessibilityLabel="Your profile picture"
                />
              )}
            </View>

            <View style={[st.badge, { backgroundColor: colors.brand }]}>
              <Text style={{ color: "#fff", fontSize: 16 }}>{profile.uri ? "✎" : "+"}</Text>
            </View>
          </Pressable>

          <Row>
            {!hydrated ? <Badge label="reading storage…" tone="warning" /> : null}
            {missing ? <Badge label="saved file is gone" tone="danger" /> : null}
            {profile.savedAt && !missing ? (
              <Badge
                label={`saved ${new Date(profile.savedAt).toLocaleTimeString()}`}
                tone="success"
              />
            ) : null}
          </Row>
        </View>
      </SectionCard>

      <SectionCard
        title="A picker URI is not durable"
        note="This is the part that looks like it works and then doesn't, days later."
      >
        <Code>{`// ❌ the picker hands back a path in a CACHE directory.
//    The OS may clear it whenever it wants. Storing this URI means
//    the avatar quietly disappears after a while.
setProfile({ uri: result.assets[0].uri });

// ✅ copy it somewhere the OS won't reclaim
const target = \`\${FileSystem.documentDirectory}profile/avatar-\${Date.now()}.jpg\`;
await FileSystem.copyAsync({ from: result.assets[0].uri, to: target });
setProfile({ uri: target });`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          <Text style={{ fontWeight: "700" }}>documentDirectory</Text> is backed up and persistent.{" "}
          <Text style={{ fontWeight: "700" }}>cacheDirectory</Text> is neither — which is exactly
          where the picker puts things.
        </Text>
      </SectionCard>

      <SectionCard
        title="Why the filename has a timestamp"
        note="Overwriting the same path produces a bug that looks like the save silently failed."
      >
        <Code>{`// ❌ same path every time
const target = \`\${documentDirectory}avatar.jpg\`;
// The file changes, the URI doesn't — so <Image> keeps showing the
// CACHED old picture. It looks like nothing happened.

// ✅ a new URI means a genuine reload
const target = \`\${documentDirectory}profile/avatar-\${Date.now()}.jpg\`;
// …and delete the previous file, or they accumulate forever.`}</Code>
      </SectionCard>

      <SectionCard
        title="Storage split: the path in AsyncStorage, the bytes on disk"
        note="AsyncStorage is for small values. An image belongs in the filesystem with only its path stored."
      >
        <Code>{`AsyncStorage  "day9.profile" → { uri, savedAt }     ~80 bytes
FileSystem    documentDirectory/profile/avatar-….jpg   ~200 KB

// Base64 in AsyncStorage would work for one small image and then
// hit Android's ~6MB limit, having also loaded the whole thing
// into JS memory to get there.`}</Code>
      </SectionCard>

      <SectionCard
        title="Handle the file being gone"
        note="Storage cleared, restored from a backup, or an OS cleanup — the stored path can outlive the file."
      >
        <Code>{`<Image source={{ uri: profile.uri }} onError={() => setMissing(true)} />

{showPlaceholder ? <Placeholder /> : <Image … />}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Without <Text style={{ fontWeight: "700" }}>onError</Text> the avatar renders as an empty
          box with no explanation, and there’s no way for the user to work out that re-picking would
          fix it.
        </Text>
      </SectionCard>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Profile picture"
        subtitle={
          profile.uri ? "Replace or remove the current one." : "Choose where to get it from."
        }
        actions={
          <>
            <Button label="Choose from library" onPress={() => choose("library")} />
            <Button label="Take a photo" variant="ghost" onPress={() => choose("camera")} />
            {profile.uri ? <Button label="Remove" variant="danger" onPress={remove} /> : null}
            <Button label="Cancel" variant="ghost" onPress={() => setSheetOpen(false)} />
          </>
        }
      />
    </Screen>
  );
}

const st = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center"
  }
});
