import { useRef } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageHeader, SectionCard, Code, Button, Row, Badge } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { useToast } from "../task-08-toast-alert-feedback/lib/ToastContext";
import ControlledInput from "./lib/ControlledInput";
import { spacing, type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();

  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const bioRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting, isDirty, isValid, touchedFields, submitCount }
  } = useForm({
    defaultValues: { name: "", email: "", phone: "", bio: "" },
    mode: "onTouched"
  });

  async function onValid(values) {
    await new Promise(resolve => setTimeout(resolve, 700));
    toast.success(`Saved ${values.name}.`);
  }

  function onInvalid(fieldErrors) {
    /* On the web RHF focuses the first bad field automatically. In React
       Native it can't — there's no DOM to focus — so setFocus is called
       explicitly, and it only works on fields registered with a ref. */
    const first = Object.keys(fieldErrors)[0];
    if (first) setFocus(first);
    toast.error(`${Object.keys(fieldErrors).length} field(s) need attention.`);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: insets.top + 44, android: 0 })}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          number={6}
          title="React Hook Form in RN"
          brief="Build a profile form using react-hook-form with validation and controlled RN inputs"
          lead="The same library as the web, with one structural difference: every field needs a Controller."
        />

        <SectionCard
          title="The form"
          note="Leave a field empty and move on — errors appear on blur, not while you type. Submit with errors and focus jumps to the first one."
        >
          <ControlledInput
            control={control}
            name="name"
            label="Full name"
            hint="As it should appear on your profile"
            placeholder="Syed Abdullah Ayaz"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            submitBehavior="submit"
            rules={{
              required: "Name is required.",
              minLength: { value: 3, message: "Name needs at least 3 characters." },
              maxLength: { value: 60, message: "Name must be under 60 characters." }
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
            textContentType="emailAddress"
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
            hint="Digits only, 10 or 11"
            placeholder="03001234567"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => bioRef.current?.focus()}
            submitBehavior="submit"
            rules={{
              required: "Phone is required.",
              pattern: {
                value: /^\d{10,11}$/,
                message: "Phone must be 10 or 11 digits, no spaces."
              }
            }}
          />

          <ControlledInput
            ref={bioRef}
            control={control}
            name="bio"
            label="Bio"
            hint="Optional, up to 160 characters"
            placeholder="A line about yourself"
            multiline
            rules={{ maxLength: { value: 160, message: "Keep the bio under 160 characters." } }}
          />

          <Row>
            <Button
              label={isSubmitting ? "Saving…" : "Save profile"}
              onPress={handleSubmit(onValid, onInvalid)}
              disabled={isSubmitting}
            />
            <Button label="Reset" variant="ghost" onPress={() => reset()} disabled={!isDirty} />
          </Row>

          <Row>
            <Badge label={`dirty: ${isDirty}`} />
            <Badge label={`valid: ${isValid}`} tone={isValid ? "success" : "neutral"} />
            <Badge label={`touched: ${Object.keys(touchedFields).length}`} />
            <Badge
              label={`errors: ${Object.keys(errors).length}`}
              tone={Object.keys(errors).length ? "danger" : "neutral"}
            />
            <Badge label={`submits: ${submitCount}`} />
          </Row>
        </SectionCard>

        <SectionCard
          title="Why register() doesn't work here"
          note="This is the one real difference from the web version, and it applies to every single field."
        >
          <Code>{`// Web — register spreads onto an <input> and works
<input {...register("email")} />

// React Native — this does NOT work:
<TextInput {...register("email")} />
//   · TextInput's ref has no .value for RHF to read
//   · it emits onChangeText(string), not an event with target.value

// So every field goes through Controller / useController:
const { field: { value, onChange, onBlur } } = useController({ control, name });

<TextInput value={value} onChangeText={onChange} onBlur={onBlur} />`}</Code>

          <Text style={[type.small, { color: colors.textMuted }]}>
            This project wraps that once in{" "}
            <Text style={{ fontWeight: "700" }}>ControlledInput</Text>, so the form body stays as
            readable as the web version instead of being four levels of render prop.
          </Text>
        </SectionCard>

        <SectionCard
          title="onChangeText, not onChange"
          note="A subtle one that produces a field which types but never validates."
        >
          <Code>{`onChange={onChange}       // ❌ RHF receives the RN event object
onChangeText={onChange}   // ✅ RHF receives the string

// RHF's field.onChange accepts a value directly, which is exactly what
// onChangeText hands it. Wiring it to onChange stores an event object
// as the field value, and every rule then fails in a confusing way.`}</Code>
        </SectionCard>

        <SectionCard
          title="Focus management is manual"
          note="On the web, RHF focuses the first invalid field for you. There's no DOM here, so it can't."
        >
          <Code>{`const { setFocus } = useForm();

handleSubmit(onValid, fieldErrors => {
  const first = Object.keys(fieldErrors)[0];
  if (first) setFocus(first);      // only works if the field forwards a ref
});`}</Code>

          <Text style={[type.small, { color: colors.textMuted }]}>
            Which is why <Text style={{ fontWeight: "700" }}>ControlledInput</Text> is wrapped in{" "}
            <Text style={{ fontWeight: "700" }}>forwardRef</Text>. Without it,{" "}
            <Text style={{ fontWeight: "700" }}>setFocus</Text> silently does nothing.
          </Text>
        </SectionCard>

        <SectionCard
          title="mode: onTouched"
          note="Complain late, forgive quickly. The same rule as the web, and it matters more on a small screen."
        >
          <Code>{`useForm({ mode: "onTouched" })

// onSubmit   — nothing until submit. Feels unresponsive.
// onChange   — errors while you're still typing. Feels hostile.
// onTouched  — validates after the first blur, then live. ✅
// onBlur     — validates on every blur, never live.`}</Code>
        </SectionCard>

        <SectionCard
          title="Is it worth the dependency here"
          note="More clearly than on the web, yes — for one reason that's specific to mobile."
        >
          <Code>{`// A controlled TextInput re-renders the whole form on every keystroke.
// On a mid-range Android phone with eight fields that's a visible
// input lag. RHF isolates each field's subscription, so typing in
// one field doesn't re-render the others.

// Below about three fields, useState is still fine.`}</Code>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
