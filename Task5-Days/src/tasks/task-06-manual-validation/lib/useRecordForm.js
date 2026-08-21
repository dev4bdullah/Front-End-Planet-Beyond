import { useCallback, useMemo, useState } from "react";
import { SCHEMAS, blankValues } from "@model/model";
import { validateField, validateAll } from "./validation";

/* The hand-rolled form hook. Task 7 replaces it with react-hook-form and the
   page there compares the two honestly. */

export function useRecordForm(entity, initial) {
  const schema = SCHEMAS[entity];

  const defaults = useMemo(() => ({ ...blankValues(entity), ...initial }), [entity, initial]);

  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState({});
  /* Which fields the user has actually left. Flagging "ab" as too short while
     someone is still typing "abdullah" reads as hostile, so a field only
     validates live after its first blur. */
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback(
    (name, value) => {
      setValues(previous => {
        const next = { ...previous, [name]: value };

        setErrors(current =>
          touched[name]
            ? {
                ...current,
                [name]: validateField(
                  schema.fields.find(f => f.name === name),
                  value,
                  next
                )
              }
            : current
        );

        return next;
      });
    },
    [touched, schema]
  );

  const handleBlur = useCallback(
    name => {
      setTouched(previous => ({ ...previous, [name]: true }));
      setErrors(previous => ({
        ...previous,
        [name]: validateField(
          schema.fields.find(f => f.name === name),
          values[name],
          values
        )
      }));
    },
    [values, schema]
  );

  const reset = useCallback(
    (next = defaults) => {
      setValues(next);
      setErrors({});
      setTouched({});
    },
    [defaults]
  );

  const handleSubmit = useCallback(
    onValid => async event => {
      event?.preventDefault();

      const nextErrors = validateAll(entity, values);
      setErrors(nextErrors);
      setTouched(Object.fromEntries(schema.fields.map(field => [field.name, true])));

      const failed = Object.keys(nextErrors);

      if (failed.length) {
        // Move focus to the first broken field, or a keyboard user has to hunt
        document.querySelector(`[name="${failed[0]}"]`)?.focus();
        return { ok: false, errors: nextErrors };
      }

      setSubmitting(true);
      try {
        await onValid(values);
        return { ok: true };
      } finally {
        setSubmitting(false);
      }
    },
    [entity, values, schema]
  );

  const errorFor = name => (touched[name] ? (errors[name] ?? "") : "");

  const isDirty = JSON.stringify(values) !== JSON.stringify(defaults);
  const errorList = Object.entries(errors).filter(([, message]) => message);

  return {
    values,
    errors,
    errorList,
    touched,
    submitting,
    isDirty,
    setValue,
    handleBlur,
    handleSubmit,
    reset,
    errorFor
  };
}
