import { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { PageHeader, SectionCard, Code, Button, Row, Badge, Screen } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { useToast } from "../task-08-toast-alert-feedback/lib/ToastContext";
import ControlledInput from "../task-06-react-hook-form-in-rn/lib/ControlledInput";
import { spacing, radius, type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [outcome, setOutcome] = useState("success");
  const [result, setResult] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    defaultValues: { username: "", password: "" },
    mode: "onTouched"
  });

  async function onValid(values) {
    setResult(null);
    await new Promise(resolve => setTimeout(resolve, 900));

    if (outcome === "success") {
      setResult({ kind: "success", message: `Saved as ${values.username}.` });
      toast.success("Profile saved.");
    } else if (outcome === "conflict") {
      /* A server-side rule the client can't know. RHF's setError puts it on
         the field itself rather than in a detached banner. */
      setResult({ kind: "error", message: "That username is already taken." });
      toast.error("Couldn't save — see the form.");
    } else {
      setResult({
        kind: "error",
        message: "Couldn't reach the server. Your changes are still here."
      });
      toast.error("Save failed.");
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <Screen>
      <PageHeader
        number={7}
        title="Mobile Validation UX"
        brief="Show inline errors, disabled submit state, success message, and failed-save message"
        lead="Four feedback states. The one people skip is the failed save — and it's the one where the user's work is at risk."
      />

      <SectionCard
        title="Try each outcome"
        note="Fill the form, choose what the fake server does, then save."
      >
        <Row>
          {[
            ["success", "succeeds"],
            ["conflict", "rejects the username"],
            ["offline", "fails to connect"]
          ].map(([key, label]) => (
            <Button
              key={key}
              label={label}
              size="sm"
              variant={outcome === key ? "primary" : "ghost"}
              onPress={() => setOutcome(key)}
            />
          ))}
        </Row>

        <ControlledInput
          control={control}
          name="username"
          label="Username"
          hint="3–20 characters, letters, numbers and underscores"
          placeholder="dev4bdullah"
          autoCapitalize="none"
          autoCorrect={false}
          rules={{
            required: "Username is required.",
            minLength: { value: 3, message: "At least 3 characters." },
            pattern: { value: /^\w+$/, message: "Letters, numbers and underscores only." }
          }}
        />

        <ControlledInput
          control={control}
          name="password"
          label="Password"
          hint="At least 8 characters including a number"
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          rules={{
            required: "Password is required.",
            minLength: { value: 8, message: "At least 8 characters." },
            validate: value => /\d/.test(value) || "Include at least one number."
          }}
        />

        <Button
          label={isSubmitting ? "Saving…" : "Save"}
          onPress={handleSubmit(onValid)}
          disabled={isSubmitting}
        />

        {/* The disabled-submit debate, resolved: the button stays ENABLED
            and submitting reveals the errors. See the section below. */}
        <Row>
          <Badge label={`valid: ${isValid}`} tone={isValid ? "success" : "neutral"} />
          <Badge label={`errors: ${errorCount}`} tone={errorCount ? "danger" : "neutral"} />
        </Row>

        {isSubmitting ? (
          <Row>
            <ActivityIndicator color={colors.brand} size="small" />
            <Text style={[type.small, { color: colors.textMuted }]}>Contacting the server…</Text>
          </Row>
        ) : null}

        {result ? (
          <View
            style={{
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: result.kind === "success" ? colors.success : colors.danger,
              backgroundColor: colors.sunk,
              padding: spacing.md,
              gap: spacing.xs
            }}
            accessibilityLiveRegion="polite"
          >
            <Text
              style={[
                type.small,
                {
                  color: result.kind === "success" ? colors.success : colors.danger,
                  fontWeight: "700"
                }
              ]}
            >
              {result.kind === "success" ? "Saved" : "Not saved"}
            </Text>
            <Text style={[type.small, { color: colors.textMuted }]}>{result.message}</Text>
            {result.kind === "error" ? (
              <Button label="Try again" size="sm" onPress={handleSubmit(onValid)} />
            ) : null}
          </View>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Don't disable the submit button"
        note="The most contested piece of form UX, and the argument against disabling is stronger on mobile."
      >
        <Code>{`// ❌ common, and worse than it looks
<Button disabled={!isValid} />

// The user sees a dead button and no explanation. On a phone the
// invalid field is often SCROLLED OFF SCREEN, so there is nothing
// visible to explain why nothing happens. A disabled button is also
// skipped by some screen readers entirely.

// ✅ keep it enabled; submitting reveals every error at once and
//    moves focus to the first one.
<Button onPress={handleSubmit(onValid, focusFirstError)} />`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Disable it while a request is <Text style={{ fontWeight: "700" }}>in flight</Text> —
          that’s different. There the reason is visible, because the label says “Saving…”.
        </Text>
      </SectionCard>

      <SectionCard
        title="Inline, not a summary at the top"
        note="A web form can show a list of errors at the top and let the user scan it. On a phone that list is off screen by the time they reach the field."
      >
        <Code>{`// The error sits directly under its own input, and the row reserves
// its height whether or not there's a message:
<Text style={{ minHeight: 15 }}>{error?.message ?? hint ?? " "}</Text>

// Without the reserved height the form jumps as errors appear —
// and a jump can move the button out from under a descending thumb.`}</Code>
      </SectionCard>

      <SectionCard
        title="A failed save must not lose the data"
        note="The state that actually matters, and the one most forms get wrong."
      >
        <Code>{`// ❌
catch (error) { reset(); showError(); }   // the user's typing is gone

// ✅ keep every value, say what happened, offer a retry
catch (error) {
  setResult({ kind: "error", message: "Couldn't reach the server. Your changes are still here." });
}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Press <Text style={{ fontWeight: "700" }}>fails to connect</Text> above and save. The form
          keeps everything and offers to try again — on a phone, retyping a form is a real cost.
        </Text>
      </SectionCard>

      <SectionCard
        title="Server errors belong on the field"
        note="Some rules only the server knows. Put the message where the problem is."
      >
        <Code>{`const { setError } = useForm();

catch (error) {
  if (error.field) setError(error.field, { message: error.message });
  else setError("root.server", { message: error.message });
}

// setError puts it in the same place as a client-side error, so the
// user doesn't have to work out which of two error systems is talking.`}</Code>
      </SectionCard>

      <SectionCard
        title="Success needs to be visible too"
        note="A save with no confirmation leaves the user pressing the button again."
      >
        <Code>{`// A toast is enough for a routine save.
// For something consequential, keep it on screen:
{result?.kind === "success" && <SuccessPanel message="Saved" />}

// accessibilityLiveRegion="polite" so a screen reader announces it —
// a green box is invisible to anyone not looking at it.`}</Code>
      </SectionCard>
    </Screen>
  );
}
