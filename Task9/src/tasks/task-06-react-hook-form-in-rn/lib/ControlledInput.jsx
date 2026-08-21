import { forwardRef } from "react";
import { View, Text, TextInput, StyleSheet, Platform } from "react-native";
import { useController } from "react-hook-form";
import { useTheme } from "../../../hooks/useTheme.jsx";
import { spacing, radius, type } from "../../../theme";

/* Task 6 — the bridge between react-hook-form and a React Native TextInput.

   On the web, register() spreads onto an <input> and works, because the DOM
   gives RHF a ref with a .value it can read. TextInput has no such thing:
   there is no .value on the native ref, and it emits onChangeText(string)
   rather than an event with a target.

   So every field in React Native needs Controller — or useController, which
   is the same thing without the render-prop nesting. */

const ControlledInput = forwardRef(function ControlledInput(
  { control, name, rules, label, hint, ...inputProps },
  ref
) {
  const { colors } = useTheme();

  const {
    field: { value, onChange, onBlur },
    fieldState: { error }
  } = useController({ control, name, rules });

  const invalid = Boolean(error);

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text style={[type.tiny, { color: colors.textMuted, textTransform: "uppercase" }]}>
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        value={value ?? ""}
        /* onChangeText, not onChange — RHF's onChange accepts the value
           directly, which is exactly what onChangeText provides. */
        onChangeText={onChange}
        onBlur={onBlur}
        placeholderTextColor={colors.textFaint}
        style={[
          s.input,
          {
            backgroundColor: colors.sunk,
            borderColor: invalid ? colors.danger : colors.border,
            color: colors.text
          },
          inputProps.multiline && s.multiline
        ]}
        accessibilityLabel={label}
        accessibilityHint={error?.message ?? hint}
        {...inputProps}
      />

      {/* Reserve the row whether or not there's a message, so the form
          doesn't jump every time an error appears or clears. */}
      <Text
        style={[type.tiny, { color: invalid ? colors.danger : colors.textFaint, minHeight: 15 }]}
        accessibilityLiveRegion={invalid ? "polite" : "none"}
      >
        {error?.message ?? hint ?? " "}
      </Text>
    </View>
  );
});

export default ControlledInput;

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: spacing.md, android: spacing.sm }),
    fontSize: 15
  },
  multiline: { minHeight: 84, textAlignVertical: "top" }
});
