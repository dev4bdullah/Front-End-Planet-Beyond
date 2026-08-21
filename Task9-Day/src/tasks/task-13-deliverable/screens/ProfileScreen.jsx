import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { useTheme, useAsyncStorage, useNetwork, useAppState } from "../../../hooks";
import { useToast } from "../../task-08-toast-alert-feedback/lib/ToastContext";
import BottomSheet, { CenterModal } from "../../task-09-modal-bottom-sheet/lib/BottomSheet";
import ControlledInput from "../../task-06-react-hook-form-in-rn/lib/ControlledInput";
import { offerSettings } from "../../task-01-permissions-overview/lib/permissions";
import { Button, Badge, Row } from "../../../shared/ui";
import { spacing, radius, type } from "../../../theme";
import { shadow } from "../../../theme/shadows";

const PROFILE_DIR = `${FileSystem.documentDirectory ?? ""}profile/`;

const EMPTY = { name: "", email: "", phone: "", bio: "", location: "" };

export default function ProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const network = useNetwork();

  const [stored, setStored, { hydrated }] = useAsyncStorage("day9.deliverable.profile", {
    ...EMPTY,
    avatar: null
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [busy, setBusy] = useState(false);
  const [avatarMissing, setAvatarMissing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [saveState, setSaveState] = useState(null);

  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const bioRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    formState: { isDirty, isSubmitting, errors }
  } = useForm({ defaultValues: EMPTY, mode: "onTouched", values: hydrated ? stored : undefined });

  /* Task 5 — keyboard height, so the save bar sits above it rather than
     under it. This MUST be useEffect: useState's initialiser runs during
     render and its return value becomes the state, so the listeners would
     never be removed. */
  useEffect(() => {
    const showEvent = Platform.select({ ios: "keyboardWillShow", android: "keyboardDidShow" });
    const hideEvent = Platform.select({ ios: "keyboardWillHide", android: "keyboardDidHide" });

    const showSub = Keyboard.addListener(showEvent, event =>
      setKeyboardHeight(event.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* Task 10 — a permission can be revoked while the app is backgrounded, so
     the cached answer is re-checked on return. */
  useAppState({
    onForeground: () => {
      if (isDirty) toast.info("Welcome back — your unsaved changes are still here.");
    }
  });

  async function pickAvatar(source) {
    setSheetOpen(false);
    setBusy(true);

    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        if (!permission.canAskAgain) {
          offerSettings({ feature: source === "camera" ? "Camera" : "Photo library" });
        } else {
          toast.warning("Permission declined — you can still fill in the rest.");
        }
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

      const info = await FileSystem.getInfoAsync(PROFILE_DIR);
      if (!info.exists) await FileSystem.makeDirectoryAsync(PROFILE_DIR, { intermediates: true });

      // A new filename, or <Image> keeps showing the cached old one
      const target = `${PROFILE_DIR}avatar-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: result.assets[0].uri, to: target });

      if (stored.avatar)
        await FileSystem.deleteAsync(stored.avatar, { idempotent: true }).catch(() => {});

      setStored(current => ({ ...current, avatar: target }));
      setAvatarMissing(false);
      toast.success("Photo updated.");
    } catch (error) {
      toast.error(error.message ?? "Couldn't set the photo.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAvatar() {
    setConfirmRemove(false);

    const previous = stored.avatar;
    setStored(current => ({ ...current, avatar: null }));
    setAvatarMissing(false);

    toast.warning("Photo removed.", {
      actionLabel: "Undo",
      onAction: () => setStored(current => ({ ...current, avatar: previous }))
    });

    // Delete only after the undo window has passed
    setTimeout(() => {
      if (previous) FileSystem.deleteAsync(previous, { idempotent: true }).catch(() => {});
    }, 8000);
  }

  async function useMyLocation() {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        toast.warning("Location is off for the whole device.");
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) offerSettings({ feature: "Location" });
        else toast.info("No problem — type it in instead.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setValue(
        "location",
        `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`,
        { shouldDirty: true }
      );
      toast.success("Location filled in.");
    } catch (error) {
      toast.error(error.message ?? "Couldn't read the location.");
    }
  }

  async function onValid(values) {
    setSaveState(null);

    // Task 11 — a save with no connection keeps the data and says so
    if (!network.online) {
      setSaveState({
        kind: "error",
        message: "You're offline. Nothing was lost — try again when you reconnect."
      });
      toast.error("Offline — not saved.");
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    setStored(current => ({ ...current, ...values }));
    reset(values);
    setSaveState({ kind: "success", message: "Profile saved to this device." });
    toast.success("Saved.");
  }

  function onInvalid(fieldErrors) {
    const first = Object.keys(fieldErrors)[0];
    if (first) setFocus(first);
    toast.error(`${Object.keys(fieldErrors).length} field(s) need attention.`);
  }

  const showPlaceholder = !stored.avatar || avatarMissing;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: insets.top + 44, android: 0 })}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: 140,
          gap: spacing.md
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.xs }}>
          <Text style={[type.tiny, { color: colors.brand, textTransform: "uppercase" }]}>
            Day 9 deliverable
          </Text>
          <Text style={[type.display, { color: colors.text }]}>Your profile</Text>
        </View>

        {!network.online ? (
          <View style={[st.banner, { backgroundColor: colors.sunk, borderColor: colors.danger }]}>
            <Text style={[type.small, { color: colors.danger, fontWeight: "700" }]}>Offline</Text>
            <Text style={[type.tiny, { color: colors.textMuted }]}>
              You can keep editing. Saving is disabled until the connection returns.
            </Text>
          </View>
        ) : null}

        <View style={{ alignItems: "center", gap: spacing.sm }}>
          <Pressable
            onPress={() => setSheetOpen(true)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={stored.avatar ? "Change profile photo" : "Add a profile photo"}
          >
            <View style={[st.avatar, { backgroundColor: colors.sunk, borderColor: colors.border }]}>
              {busy || !hydrated ? (
                <ActivityIndicator color={colors.brand} />
              ) : showPlaceholder ? (
                <Text style={{ fontSize: 34 }}>👤</Text>
              ) : (
                <Image
                  source={{ uri: stored.avatar }}
                  style={{ width: 112, height: 112, borderRadius: 56 }}
                  onError={() => setAvatarMissing(true)}
                  accessibilityLabel="Your profile photo"
                />
              )}
            </View>
            <View style={[st.fab, { backgroundColor: colors.brand }]}>
              <Text style={{ color: "#fff", fontSize: 15 }}>{stored.avatar ? "✎" : "+"}</Text>
            </View>
          </Pressable>

          {avatarMissing ? <Badge label="the saved file is gone" tone="danger" /> : null}
        </View>

        <ControlledInput
          control={control}
          name="name"
          label="Full name"
          placeholder="Syed Abdullah Ayaz"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          submitBehavior="submit"
          rules={{
            required: "Name is required.",
            minLength: { value: 3, message: "At least 3 characters." }
          }}
        />

        <ControlledInput
          ref={emailRef}
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          submitBehavior="submit"
          rules={{
            required: "Email is required.",
            validate: value =>
              (value.includes("@") && value.split("@")[1]?.includes(".")) ||
              "That doesn't look like an email address."
          }}
        />

        <ControlledInput
          ref={phoneRef}
          control={control}
          name="phone"
          label="Phone"
          hint="10 or 11 digits"
          placeholder="03001234567"
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => bioRef.current?.focus()}
          submitBehavior="submit"
          rules={{ pattern: { value: /^\d{10,11}$/, message: "10 or 11 digits, no spaces." } }}
        />

        <View style={{ gap: spacing.xs }}>
          <ControlledInput
            control={control}
            name="location"
            label="Location"
            hint="Type it, or fill it from your device"
            placeholder="Rawalpindi, PK"
          />
          <Button label="Use my location" size="sm" variant="ghost" onPress={useMyLocation} />
        </View>

        <ControlledInput
          ref={bioRef}
          control={control}
          name="bio"
          label="Bio"
          hint="Optional, up to 160 characters"
          placeholder="A line about yourself"
          multiline
          rules={{ maxLength: { value: 160, message: "Keep it under 160 characters." } }}
        />

        {saveState ? (
          <View
            style={[
              st.banner,
              {
                backgroundColor: colors.sunk,
                borderColor: saveState.kind === "success" ? colors.success : colors.danger
              }
            ]}
            accessibilityLiveRegion="polite"
          >
            <Text
              style={[
                type.small,
                {
                  color: saveState.kind === "success" ? colors.success : colors.danger,
                  fontWeight: "700"
                }
              ]}
            >
              {saveState.kind === "success" ? "Saved" : "Not saved"}
            </Text>
            <Text style={[type.tiny, { color: colors.textMuted }]}>{saveState.message}</Text>
          </View>
        ) : null}

        <Row>
          <Badge
            label={hydrated ? "loaded from storage" : "reading…"}
            tone={hydrated ? "success" : "warning"}
          />
          {isDirty ? <Badge label="unsaved changes" tone="warning" /> : null}
          {Object.keys(errors).length ? (
            <Badge label={`${Object.keys(errors).length} errors`} tone="danger" />
          ) : null}
        </Row>
      </ScrollView>

      {/* Task 5 — the save bar sits above the keyboard, so it's reachable
          exactly when the user wants it. */}
      <View
        style={[
          st.bar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: keyboardHeight ? spacing.md : insets.bottom + spacing.md,
            bottom: keyboardHeight
          },
          shadow(2)
        ]}
      >
        <Button
          label="Reset"
          variant="ghost"
          onPress={() => reset(stored)}
          disabled={!isDirty || isSubmitting}
          style={{ flex: 1 }}
        />
        <Button
          label={isSubmitting ? "Saving…" : "Save profile"}
          onPress={handleSubmit(onValid, onInvalid)}
          disabled={isSubmitting}
          style={{ flex: 2 }}
        />
      </View>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Profile photo"
        subtitle={stored.avatar ? "Replace or remove the current one." : "Choose a source."}
        actions={
          <>
            <Button label="Choose from library" onPress={() => pickAvatar("library")} />
            <Button label="Take a photo" variant="ghost" onPress={() => pickAvatar("camera")} />
            {stored.avatar ? (
              <Button
                label="Remove"
                variant="danger"
                onPress={() => {
                  setSheetOpen(false);
                  setConfirmRemove(true);
                }}
              />
            ) : null}
            <Button label="Cancel" variant="ghost" onPress={() => setSheetOpen(false)} />
          </>
        }
      />

      <CenterModal
        visible={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="Remove your photo?"
        message="You'll have a few seconds to undo before the file is deleted."
        actions={
          <>
            <Button label="Keep it" variant="ghost" onPress={() => setConfirmRemove(false)} />
            <Button label="Remove" variant="danger" onPress={removeAvatar} />
          </>
        }
      />
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  fab: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  banner: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1
  }
});
