import { useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { PageHeader, SectionCard, Code, Badge, Row, Button, styles as ui } from "../../shared/ui";
import { colors, spacing, radius, type } from "../../theme";

/* ---------- validation ---------- */

const RULES = {
  email: value => {
    if (!value.trim()) return "Email is required.";
    if (!value.includes("@")) return "Email needs an @ sign.";
    const [local, domain] = value.split("@");
    if (!local || !domain) return "Email needs text either side of the @.";
    if (!domain.includes(".")) return "Email domain needs a dot.";
    return "";
  },
  password: value => {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password needs at least 8 characters.";
    if (!/\d/.test(value)) return "Password needs at least one number.";
    return "";
  },
  name: value => {
    if (!value.trim()) return "Name is required.";
    if (value.trim().length < 3) return "Name needs at least 3 characters.";
    return "";
  }
};

/* ---------- a field that knows about the keyboard ---------- */

function Field({ label, error, hint, inputRef, ...inputProps }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[type.tiny, { color: colors.textMuted, textTransform: "uppercase" }]}>
        {label}
      </Text>

      <TextInput
        ref={inputRef}
        style={[s.input, focused && s.inputFocused, error ? s.inputError : null]}
        placeholderTextColor={colors.textFaint}
        onFocus={() => setFocused(true)}
        {...inputProps}
        onBlur={event => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        /* Announced by a screen reader, and it's what makes the error
           reachable without sight of the red border. */
        accessibilityLabel={label}
        accessibilityHint={error || hint}
      />

      {/* Reserve the row whether or not there's an error, so the form doesn't
          jump every time a message appears. */}
      <Text style={[type.tiny, { color: error ? colors.danger : colors.textFaint, minHeight: 15 }]}>
        {error || hint || " "}
      </Text>
    </View>
  );
}

export default function Screen() {
  const [values, setValues] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  /* Refs, so returnKeyType can move focus to the next field rather than
     dismissing the keyboard on every line. */
  const passwordRef = useRef(null);
  const nameRef = useRef(null);

  const set = (key, value) => {
    setValues(previous => ({ ...previous, [key]: value }));
    if (touched[key]) setErrors(previous => ({ ...previous, [key]: RULES[key](value) }));
  };

  const blur = key => {
    setTouched(previous => ({ ...previous, [key]: true }));
    setErrors(previous => ({ ...previous, [key]: RULES[key](values[key]) }));
  };

  const allErrors = Object.fromEntries(
    Object.keys(RULES).map(key => [key, RULES[key](values[key])])
  );
  const hasErrors = Object.values(allErrors).some(Boolean);

  async function submit() {
    setTouched({ email: true, password: true, name: true });
    setErrors(allErrors);

    if (hasErrors) return;

    setSubmitting(true);
    setResult(null);
    await new Promise(resolve => setTimeout(resolve, 900));
    setSubmitting(false);
    setResult(values.email);
  }

  return (
    /* padding on iOS, height on Android — the two platforms handle the
       keyboard differently, which is task 7's point applied here. */
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 90, android: 0 })}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 64 }}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          number={10}
          title="Mobile Forms"
          brief="Build login/profile forms with TextInput, validation messages, and disabled submit states"
          lead="A web form you can tab through. A mobile form has a keyboard covering half the screen and no Tab key."
        />

        <SectionCard
          title="A working login form"
          note="Fill it in. Errors appear when you leave a field, not while you type — and the submit button stays disabled until every rule passes."
        >
          <Field
            label="Email"
            value={values.email}
            onChangeText={value => set("email", value)}
            onBlur={() => blur("email")}
            error={touched.email ? errors.email : ""}
            hint="Used to sign in"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />

          <Field
            label="Password"
            inputRef={passwordRef}
            value={values.password}
            onChangeText={value => set("password", value)}
            onBlur={() => blur("password")}
            error={touched.password ? errors.password : ""}
            hint="At least 8 characters, including a number"
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            returnKeyType="next"
            onSubmitEditing={() => nameRef.current?.focus()}
            submitBehavior="submit"
          />

          <Field
            label="Display name"
            inputRef={nameRef}
            value={values.name}
            onChangeText={value => set("name", value)}
            onBlur={() => blur("name")}
            error={touched.name ? errors.name : ""}
            hint="Shown on your profile"
            placeholder="Abdullah"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <Pressable
            onPress={submit}
            disabled={hasErrors || submitting}
            style={({ pressed }) => [
              s.submit,
              (hasErrors || submitting) && s.submitDisabled,
              pressed && !hasErrors && !submitting && { opacity: 0.85 }
            ]}
            /* Disabled has to be announced, not just drawn — a dimmed button
               is invisible to a screen reader without this. */
            accessibilityRole="button"
            accessibilityState={{ disabled: hasErrors || submitting, busy: submitting }}
          >
            {submitting ? (
              <Row gap={spacing.sm}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={s.submitLabel}>Signing in…</Text>
              </Row>
            ) : (
              <Text style={s.submitLabel}>Sign in</Text>
            )}
          </Pressable>

          {hasErrors ? (
            <Text style={[type.tiny, { color: colors.textFaint, textAlign: "center" }]}>
              {Object.values(allErrors).filter(Boolean).length} field(s) still to fix
            </Text>
          ) : null}

          {result ? <Badge label={`Signed in as ${result}`} tone="success" /> : null}
        </SectionCard>

        <SectionCard
          title="Keyboard type is the cheapest usability win in mobile"
          note="The wrong keyboard means the user hunts for the @ sign on a QWERTY layout. It costs one prop."
        >
          <Code>{`keyboardType="email-address"   // @ and . on the main layout
keyboardType="numeric"         // digits only
keyboardType="phone-pad"       // digits plus + * #
keyboardType="decimal-pad"     // digits plus a decimal separator

autoCapitalize="none"          // ALWAYS for email, password, username
autoCorrect={false}            // autocorrect mangling an email is a classic
textContentType="emailAddress" // iOS autofill and password manager
autoComplete="email"           // the Android equivalent`}</Code>
          <Text style={[type.small, { color: colors.textMuted }]}>
            <Text style={ui.codeInline}>autoCapitalize</Text> defaults to sentences, which
            capitalises the first letter of an email address. Users then can’t sign in and have no
            idea why.
          </Text>
        </SectionCard>

        <SectionCard
          title="There is no Tab key"
          note="On the web, tab order is free. On a phone, moving between fields is something you have to build."
        >
          <Code>{`const passwordRef = useRef(null);

<TextInput
  returnKeyType="next"                                   // the key SAYS "next"
  onSubmitEditing={() => passwordRef.current?.focus()}   // and does it
  submitBehavior="submit"                                // don't dismiss the keyboard
/>

<TextInput ref={passwordRef} returnKeyType="done" onSubmitEditing={submit} />`}</Code>
          <Text style={[type.small, { color: colors.textMuted }]}>
            Without <Text style={ui.codeInline}>submitBehavior="submit"</Text> (previously{" "}
            <Text style={ui.codeInline}>blurOnSubmit</Text>) the keyboard closes and reopens between
            every field, which looks broken even though it technically works.
          </Text>
        </SectionCard>

        <SectionCard
          title="KeyboardAvoidingView, and why it needs a platform check"
          note="The keyboard covering the field you're typing into is the single most common React Native form bug."
        >
          <Code>{`<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.select({ ios: "padding", android: undefined })}
  keyboardVerticalOffset={Platform.select({ ios: 90, android: 0 })}
>`}</Code>
          <Text style={[type.small, { color: colors.textMuted }]}>
            Android already resizes the window when the keyboard opens (via{" "}
            <Text style={ui.codeInline}>softwareKeyboardLayoutMode</Text>), so applying{" "}
            <Text style={ui.codeInline}>padding</Text> there pushes the content twice.{" "}
            <Text style={ui.codeInline}>keyboardVerticalOffset</Text> accounts for a navigation
            header — get it wrong and the field lands under the keyboard anyway.
          </Text>
        </SectionCard>

        <SectionCard
          title="Two ScrollView props that matter with forms"
          note="Both are one word, and both fix a bug that reads as a broken app."
        >
          <Code>{`keyboardShouldPersistTaps="handled"
// Without it, the first tap only dismisses the keyboard — so the submit
// button appears to need two taps.

keyboardDismissMode="on-drag"
// Scrolling puts the keyboard away, which is what people expect.`}</Code>
        </SectionCard>

        <SectionCard
          title="Validate on blur, disable on invalid"
          note="Same rule as the web: late to complain, quick to forgive. What changes on mobile is that a disabled button has to be announced, not merely dimmed."
        >
          <Code>{`<Pressable
  disabled={hasErrors || submitting}
  accessibilityRole="button"
  accessibilityState={{ disabled: hasErrors || submitting, busy: submitting }}
>`}</Code>
          <Text style={[type.small, { color: colors.textMuted }]}>
            The error text row reserves its height whether or not there’s a message. Without that,
            the form jumps every time an error appears — and on a small screen a jump can move the
            button out from under a thumb that’s already descending.
          </Text>
        </SectionCard>

        <SectionCard
          title="What this deliberately doesn't do"
          note="No password strength meter, no async username check, no form library."
        >
          <Code>{`// react-hook-form works in React Native too:
import { useForm, Controller } from "react-hook-form";

// TextInput has no native ref/event API that register() can attach to,
// so every field needs Controller — which is exactly the case task 7
// of Day 5 describes.`}</Code>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  input: {
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: spacing.md, android: spacing.sm }),
    color: colors.text,
    fontSize: 15
  },
  inputFocused: { borderColor: colors.brand },
  inputError: { borderColor: colors.danger },
  submit: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs
  },
  submitDisabled: { backgroundColor: colors.border },
  submitLabel: { color: "#fff", fontSize: 15, fontWeight: "700" }
});
