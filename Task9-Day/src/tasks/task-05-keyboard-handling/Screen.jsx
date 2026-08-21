import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageHeader, SectionCard, Code, Button, Row, Badge } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { spacing, radius, type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [values, setValues] = useState({ name: "", email: "", bio: "" });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [visible, setVisible] = useState(false);

  const emailRef = useRef(null);
  const bioRef = useRef(null);

  useEffect(() => {
    /* The event names differ per platform. Using the Android names on iOS
       means the listener fires after the animation, so any layout you compute
       from it is a frame late. */
    const showEvent = Platform.select({ ios: "keyboardWillShow", android: "keyboardDidShow" });
    const hideEvent = Platform.select({ ios: "keyboardWillHide", android: "keyboardDidHide" });

    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
      setVisible(true);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const set = (key, value) => setValues(current => ({ ...current, [key]: value }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      /* padding on iOS; Android resizes the window itself, so applying
         padding there pushes the content twice. */
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: insets.top + 44, android: 0 })}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 96 }}
        /* Without "handled", the first tap only dismisses the keyboard — so
           the submit button appears to need two taps. */
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <PageHeader
          number={5}
          title="Keyboard Handling"
          brief="Use KeyboardAvoidingView, ScrollView, input focus handling, and safe submit button placement"
          lead="The keyboard covers half the screen. Everything here is about the half that's left."
        />

        <SectionCard
          title="Live keyboard metrics"
          note="Focus a field below and watch these. The height differs between devices, and with a third-party keyboard it differs again."
        >
          <Row>
            <Badge
              label={visible ? "keyboard up" : "keyboard down"}
              tone={visible ? "brand" : "neutral"}
            />
            <Badge label={`height: ${Math.round(keyboardHeight)}`} />
            <Badge label={Platform.OS} />
          </Row>
        </SectionCard>

        <SectionCard
          title="A form that behaves"
          note="Return moves to the next field rather than dismissing the keyboard. The last field submits."
        >
          <View style={{ gap: spacing.sm }}>
            <TextInput
              value={values.name}
              onChangeText={value => set("name", value)}
              placeholder="Name"
              placeholderTextColor={colors.textFaint}
              style={[
                st.input,
                { backgroundColor: colors.sunk, borderColor: colors.border, color: colors.text }
              ]}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              submitBehavior="submit"
              autoCapitalize="words"
            />

            <TextInput
              ref={emailRef}
              value={values.email}
              onChangeText={value => set("email", value)}
              placeholder="Email"
              placeholderTextColor={colors.textFaint}
              style={[
                st.input,
                { backgroundColor: colors.sunk, borderColor: colors.border, color: colors.text }
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => bioRef.current?.focus()}
              submitBehavior="submit"
            />

            <TextInput
              ref={bioRef}
              value={values.bio}
              onChangeText={value => set("bio", value)}
              placeholder="A short bio"
              placeholderTextColor={colors.textFaint}
              style={[
                st.input,
                st.multiline,
                { backgroundColor: colors.sunk, borderColor: colors.border, color: colors.text }
              ]}
              multiline
              numberOfLines={3}
              returnKeyType="done"
              /* On a multiline field, returnKeyType alone can't submit —
                 Return inserts a newline, which is correct. Give it an
                 explicit button instead. */
            />

            <Button label="Save" onPress={() => Keyboard.dismiss()} />
          </View>
        </SectionCard>

        <SectionCard
          title="KeyboardAvoidingView needs a platform check"
          note="The most common React Native form bug is a field hidden behind the keyboard. The second most common is content pushed twice on Android."
        >
          <Code>{`<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.select({ ios: "padding", android: undefined })}
  keyboardVerticalOffset={Platform.select({ ios: insets.top + 44, android: 0 })}
>

// Android already resizes the window (softwareKeyboardLayoutMode), so
// applying "padding" there moves everything twice as far as it should.
// keyboardVerticalOffset accounts for a navigation header — get it wrong
// and the field still lands under the keyboard.`}</Code>
        </SectionCard>

        <SectionCard
          title="Two ScrollView props that fix real bugs"
          note="Both are one word, and both fix something that reads as a broken app."
        >
          <Code>{`keyboardShouldPersistTaps="handled"
// Without it, the first tap anywhere just dismisses the keyboard.
// The submit button then appears to need two taps.

keyboardDismissMode="on-drag"
// Scrolling puts the keyboard away, which is what people expect.`}</Code>
        </SectionCard>

        <SectionCard
          title="There is no Tab key"
          note="On the web, focus order is free. On a phone it's something you build."
        >
          <Code>{`const emailRef = useRef(null);

<TextInput
  returnKeyType="next"                                // the key SAYS next
  onSubmitEditing={() => emailRef.current?.focus()}   // and does it
  submitBehavior="submit"                             // don't dismiss between fields
/>`}</Code>

          <Text style={[type.small, { color: colors.textMuted }]}>
            <Text style={{ fontWeight: "700" }}>submitBehavior</Text> replaced{" "}
            <Text style={{ fontWeight: "700" }}>blurOnSubmit</Text>. Without it the keyboard closes
            and reopens between every field — technically working, visibly broken.
          </Text>
        </SectionCard>

        <SectionCard
          title="Where the submit button goes"
          note="Two options, and the wrong one puts the button under the keyboard exactly when the user wants it."
        >
          <Code>{`// A: at the end of the scroll content
// Simple. The user scrolls to it. Fine for a long form.

// B: pinned above the keyboard
<View style={{ position: "absolute", bottom: keyboardHeight || insets.bottom }}>
  <Button label="Save" />
</View>
// Always reachable. Needs the keyboard height from the listeners above,
// and needs to fall back to the safe-area inset when it's down.`}</Code>

          <Text style={[type.small, { color: colors.textMuted }]}>
            Task 13’s deliverable uses B, because a profile form with a hidden Save button is the
            exact failure this task is about.
          </Text>
        </SectionCard>

        <SectionCard
          title="Dismissing on a tap outside"
          note="Expected behaviour, and it needs a wrapper because a View doesn't receive taps on empty space."
        >
          <Code>{`<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
  <View style={{ flex: 1 }}>{children}</View>
</TouchableWithoutFeedback>

// accessible={false} so a screen reader doesn't announce the whole
// screen as one enormous button.`}</Code>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: spacing.md, android: spacing.sm }),
    fontSize: 15
  },
  multiline: { minHeight: 84, textAlignVertical: "top" }
});
