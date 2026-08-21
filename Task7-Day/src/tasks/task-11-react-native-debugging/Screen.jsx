import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Platform, LogBox } from "react-native";
import { PageHeader, SectionCard, Code, Badge, Row, Button, styles as ui } from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";

/* A component that throws on demand, so the error path is reachable rather
   than described. */
function Exploder({ armed }) {
  if (armed)
    throw new Error("Deliberate crash from task 11 — this is what a red screen looks like.");
  return <Text style={[type.small, { color: colors.textMuted }]}>Nothing wrong here.</Text>;
}

export default function Screen() {
  const [armed, setArmed] = useState(false);
  const [log, setLog] = useState([]);

  const note = message =>
    setLog(list => [`${new Date().toLocaleTimeString()} — ${message}`, ...list].slice(0, 8));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={11}
        title="React Native Debugging"
        brief="Use Metro logs, React DevTools, emulator logs, and basic error tracing"
        lead="Four layers, and knowing which one a problem lives in is most of the work."
      />

      <SectionCard
        title="Which layer is broken"
        note="Before reaching for a tool, decide where the failure is. The wrong layer means hours in the wrong logs."
      >
        <Code>{`Your JS          → Metro terminal, console.log, React DevTools
React tree       → React DevTools (props, state, re-renders)
The bridge       → red screen, or a native module that's undefined
Native (Android) → adb logcat
Native (iOS)     → Xcode console
Build            → Metro's terminal output, gradle/xcodebuild logs`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          A rule of thumb: if the app renders and then behaves wrongly, it’s JS. If it never
          renders, or dies on launch, look at native.
        </Text>
      </SectionCard>

      <SectionCard
        title="Metro is the terminal you already have open"
        note="Every console call lands here. It's the fastest loop, and the one people abandon too early for a debugger."
      >
        <Code>{`npx expo start          # Metro starts with it

console.log(value)
console.warn("…")       # also a yellow LogBox banner in the app
console.error("…")      # also a red LogBox banner

console.table(products)          # readable arrays of objects
console.log(JSON.stringify(obj, null, 2))   # objects log as [Object] otherwise`}</Code>

        <Row>
          <Button
            label="console.log"
            onPress={() => {
              console.log("task 11 — a log line");
              note("console.log fired");
            }}
          />
          <Button
            label="console.warn"
            variant="ghost"
            onPress={() => {
              console.warn("task 11 — a warning");
              note("console.warn fired (check Metro)");
            }}
          />
        </Row>

        <View style={s.log}>
          {log.length ? (
            log.map((line, index) => (
              <Text key={index} style={s.logLine}>
                &gt; {line}
              </Text>
            ))
          ) : (
            <Text style={s.logLine}>&gt; press a button, then look at the Metro terminal</Text>
          )}
        </View>

        <Text style={[type.small, { color: colors.textMuted }]}>
          <Text style={ui.codeInline}>console.log(someObject)</Text> prints{" "}
          <Text style={ui.codeInline}>[Object]</Text> in Metro and tells you nothing — stringify it,
          or use <Text style={ui.codeInline}>console.table</Text>.
        </Text>
      </SectionCard>

      <SectionCard
        title="The dev menu"
        note="The single most useful shortcut in React Native, and it's easy to go months without knowing it exists."
      >
        <Code>{`Device:     shake it
iOS sim:    Cmd + D
Android:    Cmd + M (macOS) / Ctrl + M

In the menu:
  Reload                    — faster than restarting Metro
  Open React DevTools       — the component tree
  Toggle element inspector  — tap any view to see its styles and hierarchy
  Toggle performance monitor — live FPS for both JS and UI threads`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          The element inspector is the closest thing to browser DevTools you get. Tap a view and it
          shows the box model, the applied styles and where it sits in the tree.
        </Text>
      </SectionCard>

      <SectionCard
        title="Two FPS counters, not one"
        note="The performance monitor shows JS and UI separately, and which one is dropping tells you what kind of problem you have."
      >
        <Code>{`JS thread low, UI fine   → your JavaScript is slow
                            (an expensive render, an unmemoised list row)

UI thread low            → the native side is struggling
                            (too many views, large images, heavy shadows on Android)

Both low                 → usually a huge list rendered without windowing`}</Code>
      </SectionCard>

      <SectionCard
        title="React DevTools"
        note="The same tool as on the web, connected over the network rather than through a browser tab."
      >
        <Code>{`npx react-devtools          # then open the dev menu → Open React DevTools

# What it's actually good for:
#  - props and state of any component, live
#  - the Profiler: which components re-rendered and why
#  - "Highlight updates when components render" — the flashing borders
#    that reveal a component re-rendering on every keystroke`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          The highlight-updates option is the fastest way to find a missing{" "}
          <Text style={ui.codeInline}>memo</Text> or an unstable prop. If a whole list flashes when
          one row changes, the row isn’t memoised.
        </Text>
      </SectionCard>

      <SectionCard
        title="Native logs, when JS tools have nothing to say"
        note="A crash on launch, a permission failure, or a missing native module never reaches Metro. It's in the platform log."
      >
        <Code>{`# Android
adb logcat *:S ReactNative:V ReactNativeJS:V     # filtered to RN only
adb logcat --pid=$(adb shell pidof com.dev4bdullah.day7)
adb devices                                       # is anything even connected?

# iOS
npx react-native log-ios
# or Xcode → Window → Devices and Simulators → View Device Logs`}</Code>
        <Text style={[type.small, { color: colors.textMuted }]}>
          Unfiltered <Text style={ui.codeInline}>adb logcat</Text> is a firehose from the whole
          device. The filtered form above is the one worth memorising.
        </Text>
      </SectionCard>

      <SectionCard
        title="Red screens and yellow boxes"
        note="LogBox. Red is a thrown error, yellow is a warning. Both only appear in development."
      >
        <Code>{`// Suppress a specific known-noisy warning — never a blanket ignore
LogBox.ignoreLogs(["Require cycle:"]);

// LogBox.ignoreAllLogs() exists. Using it means you stop seeing the
// warning that would have explained your next bug.`}</Code>

        <Row>
          <Button
            label={armed ? "Disarm" : "Throw a real error"}
            variant={armed ? "ghost" : "danger"}
            onPress={() => {
              setArmed(value => !value);
              note(armed ? "disarmed" : "armed — expect a red screen");
            }}
          />
        </Row>

        <View style={s.exploderBox}>
          <Exploder armed={armed} />
        </View>

        <Text style={[type.small, { color: colors.textMuted }]}>
          In a production build there is no red screen — the app closes instead. That’s what error
          boundaries and a crash reporter are for.
        </Text>
      </SectionCard>

      <SectionCard
        title="Errors that mean something specific"
        note="Four messages worth recognising on sight, because each has one usual cause."
      >
        <Code>{`"Unable to resolve module ./Foo"
   → the path is wrong, or Metro's cache is stale. npx expo start -c

"undefined is not an object (evaluating 'x.y')"
   → the classic. Something async hasn't arrived yet — guard it.

"Objects are not valid as a React child"
   → you rendered an object. Usually {item} instead of {item.name}.

"Text strings must be rendered within a <Text> component"
   → a bare string inside a <View>. RN has no implicit text node,
     unlike the web where a stray string just works.`}</Code>
      </SectionCard>

      <SectionCard
        title="Clear the cache before believing anything"
        note="A surprising share of impossible React Native bugs are a stale Metro cache. Rule it out first, it costs thirty seconds."
      >
        <Code>{`npx expo start -c                # clear the Metro cache
rm -rf node_modules && npm i     # when a dependency changed
cd android && ./gradlew clean    # Android build weirdness
# iOS: Xcode → Product → Clean Build Folder`}</Code>
      </SectionCard>

      <SectionCard
        title="This environment"
        note="Read at runtime, so the values are real rather than assumed."
      >
        <Row>
          <Badge label={`Platform: ${Platform.OS}`} />
          <Badge label={`__DEV__: ${String(__DEV__)}`} tone={__DEV__ ? "warning" : "success"} />
          <Badge label={`LogBox: ${typeof LogBox === "object" ? "available" : "absent"}`} />
        </Row>
        <Text style={[type.small, { color: colors.textMuted }]}>
          <Text style={ui.codeInline}>__DEV__</Text> is true in development and false in a release
          build. Wrapping debug-only code in it means the logging never ships.
        </Text>
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  log: {
    backgroundColor: "#0a0c12",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2
  },
  logLine: {
    color: "#8fe3a6",
    fontSize: 11,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" })
  },
  exploderBox: {
    backgroundColor: colors.sunk,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center"
  }
});
