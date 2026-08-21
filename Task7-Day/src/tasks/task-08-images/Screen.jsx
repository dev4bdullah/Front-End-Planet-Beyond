import { useState } from "react";
import { ScrollView, View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { PageHeader, SectionCard, Code, Badge, Row, Button, styles as ui } from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";

/* A small component wrapping the three states every remote image has:
   loading, loaded, failed. RN gives you the callbacks; the states are yours. */
function RemoteImage({ uri, size = 96, label }) {
  const [status, setStatus] = useState("loading");

  return (
    <View style={{ gap: spacing.xs, alignItems: "center" }}>
      <View style={[s.frame, { width: size, height: size }]}>
        {status !== "failed" ? (
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: radius.md }}
            resizeMode="cover"
            onLoadStart={() => setStatus("loading")}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("failed")}
            /* Alt text for screen readers — an image with no label is
               announced as "image", which tells nobody anything. */
            accessible
            accessibilityLabel={label}
          />
        ) : (
          <View style={s.fallback}>
            <Text style={{ fontSize: 22 }}>🖼️</Text>
            <Text style={[type.tiny, { color: colors.textFaint }]}>unavailable</Text>
          </View>
        )}

        {status === "loading" ? (
          <View style={s.overlay}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : null}
      </View>

      <Badge
        label={status}
        tone={status === "loaded" ? "success" : status === "failed" ? "danger" : "neutral"}
      />
    </View>
  );
}

export default function Screen() {
  const [seed, setSeed] = useState(1);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={8}
        title="Images"
        brief="Render local assets, remote images, placeholders, and fallback UI for failed image loads"
        lead="A remote image has three states, and the one people skip is the one users see on a bad connection."
      />

      <SectionCard
        title="Local vs remote"
        note="The two take different source shapes, and the difference is not cosmetic — a local asset is bundled at build time, so its path must be a literal string."
      >
        <Code>{`// local — require, bundled by Metro, size known at build time
<Image source={require("../../assets/logo.png")} />

// remote — an object with a uri, and width/height are REQUIRED
<Image source={{ uri: "https://…/photo.jpg" }} style={{ width: 96, height: 96 }} />

// ❌ this does not work — Metro cannot resolve a dynamic require
const name = "logo";
<Image source={require(\`../../assets/\${name}.png\`)} />

// ✅ a lookup map instead
const IMAGES = { logo: require("../../assets/logo.png") };
<Image source={IMAGES[name]} />`}</Code>
        <Text style={ui.note}>
          A remote image with no explicit width and height renders at zero pixels. React Native
          cannot know the dimensions before the download finishes, so it does not guess — unlike a
          browser, which reflows once the image arrives.
        </Text>
      </SectionCard>

      <SectionCard
        title="Three states, live"
        note="The third image points at a host that doesn't exist, so you can watch the failure path rather than take it on faith."
      >
        <Row gap={spacing.lg} style={{ justifyContent: "space-around" }}>
          <RemoteImage
            uri={`https://picsum.photos/seed/rn-a${seed}/200/200`}
            label="A random photograph"
          />
          <RemoteImage
            uri={`https://picsum.photos/seed/rn-b${seed}/200/200`}
            label="Another random photograph"
          />
          <RemoteImage
            uri="https://no-such-host-9x7q.invalid/photo.jpg"
            label="An image that will fail to load"
          />
        </Row>

        <Button
          label="Reload with new seeds"
          size="sm"
          variant="ghost"
          onPress={() => setSeed(n => n + 1)}
        />

        <Code>{`const [status, setStatus] = useState("loading");

<Image
  source={{ uri }}
  onLoadStart={() => setStatus("loading")}
  onLoad={()      => setStatus("loaded")}
  onError={()     => setStatus("failed")}
/>

{status === "loading" && <ActivityIndicator />}
{status === "failed"  && <FallbackTile />}`}</Code>
      </SectionCard>

      <SectionCard
        title="resizeMode"
        note="The equivalent of object-fit, and the source of most 'why is my image squashed' questions."
      >
        <Row gap={spacing.md} style={{ justifyContent: "space-around" }}>
          {["cover", "contain", "stretch"].map(mode => (
            <View key={mode} style={{ alignItems: "center", gap: spacing.xs }}>
              <Image
                source={{ uri: `https://picsum.photos/seed/mode${seed}/300/150` }}
                style={s.modeBox}
                resizeMode={mode}
              />
              <Text style={[type.tiny, { color: colors.textMuted }]}>{mode}</Text>
            </View>
          ))}
        </Row>
        <Code>{`cover     fills the box, crops the overflow      ← the usual choice
contain   fits inside, leaves empty space
stretch   fills the box, distorts the aspect ratio
center    original size, centred, cropped if larger
repeat    tiles (iOS only)`}</Code>
      </SectionCard>

      <SectionCard
        title="A placeholder that doesn't shift the layout"
        note="The frame is a fixed-size View with a background. The image sits inside it, so nothing moves when the download finishes — the same argument as a skeleton on the web."
      >
        <Code>{`<View style={{ width: 96, height: 96, backgroundColor: "#12151d", borderRadius: 10 }}>
  <Image style={StyleSheet.absoluteFill} source={{ uri }} />
  {loading && <ActivityIndicator style={StyleSheet.absoluteFill} />}
</View>

// StyleSheet.absoluteFill = { position: "absolute", top/left/right/bottom: 0 }`}</Code>
      </SectionCard>

      <SectionCard title="Four things worth knowing">
        <View style={{ gap: spacing.sm }}>
          {[
            [
              "defaultSource",
              "a local placeholder shown while a remote image loads — iOS only, and ignored in debug builds"
            ],
            [
              "Caching",
              "RN caches remote images in memory and on disk automatically; expo-image adds control over it"
            ],
            [
              "@2x and @3x",
              "logo.png, logo@2x.png, logo@3x.png — Metro picks by device density with no code"
            ],
            [
              "accessibilityLabel",
              "an unlabelled image is announced as 'image'; decorative ones should set accessible={false}"
            ]
          ].map(([title, detail]) => (
            <Row key={title} gap={spacing.sm}>
              <Badge label={title} tone="brand" />
              <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>{detail}</Text>
            </Row>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="expo-image, when the built-in isn't enough"
        note="Worth knowing it exists. It adds blurhash placeholders, better caching control and content transitions — but the built-in Image is the right default and has no extra dependency."
      >
        <Code>{`import { Image } from "expo-image";

<Image
  source={uri}
  placeholder={{ blurhash }}        // a blurred preview from a short hash
  contentFit="cover"                 // resizeMode, renamed
  transition={200}                   // fade in when loaded
/>`}</Code>
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  frame: {
    borderRadius: radius.md,
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  fallback: { alignItems: "center", justifyContent: "center", gap: 2 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sunk
  },
  modeBox: {
    width: 84,
    height: 84,
    borderRadius: radius.sm,
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderColor: colors.border
  }
});
