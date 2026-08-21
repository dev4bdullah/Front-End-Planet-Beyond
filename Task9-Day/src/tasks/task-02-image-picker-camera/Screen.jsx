import { useState } from "react";
import { View, Text, Image, ActivityIndicator, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
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
import { offerSettings } from "../task-01-permissions-overview/lib/permissions";
import { spacing, radius, type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [asset, setAsset] = useState(null);
  const [busy, setBusy] = useState(false);
  const [compressed, setCompressed] = useState(null);

  async function pick(source) {
    setBusy(true);

    try {
      /* Request the permission for the source actually being used. Asking for
         the camera when the user tapped "choose from library" is a real and
         common bug — and on iOS it burns the one prompt you get. */
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        if (!permission.canAskAgain) {
          offerSettings({ feature: source === "camera" ? "Camera" : "Photo library" });
        } else {
          toast.warning("Permission declined — nothing was opened.");
        }
        return;
      }

      const options = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      };

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      /* Cancelling is NOT an error. Treating it as one produces an error toast
         every time someone changes their mind, which is most of the time. */
      if (result.canceled) {
        toast.info("Cancelled.");
        return;
      }

      setAsset(result.assets[0]);
      setCompressed(null);
      toast.success("Image selected.");
    } catch (error) {
      toast.error(error.message ?? "Could not open the picker.");
    } finally {
      setBusy(false);
    }
  }

  async function compress() {
    if (!asset) return;
    setBusy(true);

    try {
      const context = ImageManipulator.ImageManipulator.manipulate(asset.uri);
      context.resize({ width: 512 });
      const rendered = await context.renderAsync();
      const output = await rendered.saveAsync({
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG
      });

      setCompressed(output);
      toast.success("Resized to 512px wide.");
    } catch (error) {
      toast.error(`Could not process the image: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        number={2}
        title="Image Picker / Camera"
        brief="Use an image picker or camera module to select a profile image from device media"
        lead="Two sources, two permissions, and one result shape. The case people forget is the user pressing cancel."
      />

      <SectionCard
        title="Pick an image"
        note="Camera and library are separate permissions. Each is requested only when its own button is pressed."
      >
        <Row>
          <Button label="Choose from library" onPress={() => pick("library")} disabled={busy} />
          <Button
            label="Take a photo"
            variant="ghost"
            onPress={() => pick("camera")}
            disabled={busy}
          />
          {asset ? (
            <Button
              label="Clear"
              variant="ghost"
              size="sm"
              onPress={() => {
                setAsset(null);
                setCompressed(null);
              }}
            />
          ) : null}
        </Row>

        <View style={[s(colors).preview]}>
          {busy ? (
            <ActivityIndicator color={colors.brand} />
          ) : asset ? (
            <Image
              source={{ uri: (compressed ?? asset).uri }}
              style={{ width: 160, height: 160, borderRadius: radius.lg }}
              resizeMode="cover"
              accessibilityLabel="The image you selected"
            />
          ) : (
            <Text style={[type.small, { color: colors.textFaint }]}>Nothing selected yet</Text>
          )}
        </View>

        {asset ? (
          <>
            <KeyValue
              items={[
                ["Dimensions", `${asset.width} × ${asset.height}`],
                [
                  "File size",
                  asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : "not reported"
                ],
                ["Type", asset.mimeType ?? "unknown"],
                ["URI", `${String(asset.uri).slice(0, 42)}…`]
              ]}
            />
            <Row>
              <Button
                label="Resize to 512px"
                size="sm"
                variant="ghost"
                onPress={compress}
                disabled={busy}
              />
              {compressed ? <Badge label="showing the resized copy" tone="success" /> : null}
            </Row>
          </>
        ) : null}
      </SectionCard>

      <SectionCard
        title="The result shape"
        note="One object for both sources, which is what lets a single handler serve the camera and the library."
      >
        <Code>{`const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ["images"],       // an ARRAY now — MediaTypeOptions is deprecated
  allowsEditing: true,          // the system crop UI
  aspect: [1, 1],               // Android only; iOS always crops square
  quality: 0.8                  // 0–1, JPEG compression
});

if (result.canceled) return;    // ← not an error. Just leave.

const asset = result.assets[0]; // ALWAYS an array, even for one image
// { uri, width, height, fileSize, mimeType, fileName, exif?, base64? }`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Two things that catch people: <Text style={{ fontWeight: "700" }}>assets</Text> is an
          array even when you asked for one image, and{" "}
          <Text style={{ fontWeight: "700" }}>canceled</Text> is spelled with one L.
        </Text>
      </SectionCard>

      <SectionCard
        title="Cancel is not an error"
        note="The single most common mistake in this API. A user changing their mind is the normal path, not a failure."
      >
        <Code>{`// ❌ an error toast every time someone backs out
try { const result = await launchImageLibraryAsync(); use(result.assets[0]); }
catch (error) { toast.error("Failed to pick image"); }

// ✅
if (result.canceled) return;`}</Code>
      </SectionCard>

      <SectionCard
        title="Compress before you upload"
        note="A modern phone camera produces a 4–12MB JPEG. Uploading that as a 96px avatar wastes the user's data and your storage."
      >
        <Code>{`const context = ImageManipulator.ImageManipulator.manipulate(uri);
context.resize({ width: 512 });
const rendered = await context.renderAsync();
const output = await rendered.saveAsync({ compress: 0.6, format: SaveFormat.JPEG });

// quality: 0.8 in the picker is a first pass, but it doesn't RESIZE —
// a 4032×3024 image at quality 0.8 is still enormous.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Press <Text style={{ fontWeight: "700" }}>Resize to 512px</Text> above and compare the
          reported file size. The API changed in SDK 54 — the old{" "}
          <Text style={{ fontWeight: "700" }}>manipulateAsync</Text> is deprecated in favour of this
          context form.
        </Text>
      </SectionCard>

      <SectionCard
        title="expo-image-picker or expo-camera"
        note="They solve different problems, and reaching for the wrong one costs a lot of work."
      >
        <Code>{`expo-image-picker   the SYSTEM picker and camera UI.
                    Familiar, accessible, free crop UI, no layout work.
                    Use it unless you have a specific reason not to.

expo-camera         a camera VIEW you embed and control.
                    For barcode scanning, a custom overlay, or recording
                    with your own controls. You build the whole UI.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          A profile picture wants the system picker. Rebuilding a camera UI to take one photo is
          weeks of work to arrive somewhere worse than what the OS already gives you.
        </Text>
      </SectionCard>

      <SectionCard title="Platform notes">
        <KeyValue
          items={[
            ["Running on", Platform.OS],
            ["aspect prop", "Android honours it; iOS always crops square when allowsEditing"],
            ["Simulator camera", "iOS simulators have no camera — launchCameraAsync fails there"],
            ["base64", "available, but a large image as base64 in JS memory is a crash risk"]
          ]}
        />
      </SectionCard>
    </Screen>
  );
}

const s = colors => ({
  preview: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sunk,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  }
});
