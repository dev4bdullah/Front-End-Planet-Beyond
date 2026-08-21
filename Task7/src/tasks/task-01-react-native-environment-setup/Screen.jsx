import { ScrollView, Text, View, Platform } from "react-native";
import Constants from "expo-constants";
import { PageHeader, SectionCard, Code, KeyValue, Badge, Row, styles as ui } from "../../shared/ui";
import { colors, spacing, type } from "../../theme";

/* Task 1 — the environment. Everything on this screen is read from the device
   at runtime, so it doubles as proof the setup actually worked. */

export default function Screen() {
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={1}
        title="Environment Setup"
        brief="Install Node, JDK, Android Studio, emulator/device setup, and Xcode CLI tools where applicable"
        lead="If you're reading this on a device or emulator, the setup worked. Everything below is read at runtime."
      />

      <SectionCard title="What this device reports">
        <KeyValue
          items={[
            ["Platform", Platform.OS],
            ["OS version", String(Platform.Version)],
            ["Expo SDK", Constants.expoConfig?.sdkVersion ?? "—"],
            ["App version", Constants.expoConfig?.version ?? "—"],
            ["Dev build", String(__DEV__)],
            ["New architecture", String(Platform.constants?.reactNativeVersion ? true : false)]
          ]}
        />
        <Text style={ui.note}>
          <Text style={{ color: colors.text }}>__DEV__</Text> is a global React Native injects. It
          is true in Metro and false in a production build, which is how debug-only code gets
          stripped.
        </Text>
      </SectionCard>

      <SectionCard
        title="The two routes in"
        note="Expo Go is the fast path and what this project uses. A bare React Native CLI project gives you full native control and a much longer setup."
      >
        <View style={{ gap: spacing.sm }}>
          <View style={{ gap: spacing.xs }}>
            <Row>
              <Badge label="Expo" tone="brand" />
              <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>
                what this project uses
              </Text>
            </Row>
            <Text style={ui.note}>
              Node LTS, then the Expo Go app on a phone. No Android Studio, no Xcode, no JDK needed
              to start. A QR code from Metro opens the app on a real device.
            </Text>
          </View>

          <View style={{ gap: spacing.xs }}>
            <Row>
              <Badge label="Bare RN CLI" />
              <Text style={[type.small, { color: colors.text, fontWeight: "700" }]}>
                when you need custom native code
              </Text>
            </Row>
            <Text style={ui.note}>
              Node, JDK 17, Android Studio with the SDK and an AVD, and on macOS Xcode plus the
              command line tools and CocoaPods. Hours, not minutes.
            </Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Install, the short version">
        <Code>{`# Node LTS via nvm — never apt, it ships an ancient version
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts

# create the app
npx create-expo-app@latest my-app
cd my-app
npx expo start

# then: scan the QR with Expo Go, or press
#   a  → Android emulator
#   i  → iOS simulator (macOS only)
#   w  → web`}</Code>
      </SectionCard>

      <SectionCard
        title="Android, if you want an emulator"
        note="Needed for a bare project, and useful even with Expo. The environment variables are the part people miss."
      >
        <Code>{`1. Android Studio → SDK Manager → install:
     Android SDK Platform 35 · SDK Build-Tools · Platform-Tools
     Android Emulator · Intel HAXM or the ARM image on Apple silicon

2. Device Manager → create a virtual device (Pixel 7, API 35)

3. Set the environment variables — the step that breaks builds when skipped:

   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

4. Verify:
   adb devices        # should list the emulator
   java -version      # must be JDK 17 for RN 0.87`}</Code>
        <Text style={ui.note}>
          JDK version is the single most common Android build failure. React Native 0.87 wants JDK
          17 — JDK 21 produces an error that names Gradle rather than Java, which sends people in
          the wrong direction.
        </Text>
      </SectionCard>

      <SectionCard
        title="iOS, macOS only"
        note="There is no way around this one. Building for iOS requires macOS and Xcode — a Windows or Linux machine can develop the JavaScript but cannot produce an iOS build."
      >
        <Code>{`xcode-select --install          # command line tools
sudo gem install cocoapods       # native dependency manager
cd ios && pod install            # bare projects only, not Expo Go`}</Code>
        <Text style={ui.note}>
          Expo's EAS Build sidesteps this by compiling on a hosted Mac, which is the practical
          answer if you're on Windows and need a TestFlight build.
        </Text>
      </SectionCard>

      <SectionCard title="Physical device or emulator">
        <KeyValue
          items={[
            ["Emulator", "fast to reset, easy to record, wrong performance profile"],
            ["Physical device", "real touch targets, real scroll feel, real network"],
            ["Test on both", "layout bugs hide on one and appear on the other"],
            ["Notch and safe area", "only honest on a real device or a notched AVD"]
          ]}
        />
        <Text style={ui.note}>
          A physical device is connected over the same wifi as the Metro server. If the QR code
          scans but nothing loads, that’s almost always the two being on different networks — or a
          firewall on port 8081.
        </Text>
      </SectionCard>
    </ScrollView>
  );
}
