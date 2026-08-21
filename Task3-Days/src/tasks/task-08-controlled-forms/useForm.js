import { useState, useCallback } from "react";

/* One hook covering the parts every form repeats: values, errors, touched
   tracking, validation on blur, and a submit that blocks when invalid.

   `validators` is an object of { fieldName: value => "" | "error message" }. */

export function useForm({ initialValues, validators = {}, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const runValidator = useCallback(
    (name, value, allValues) => validators[name]?.(value, allValues) ?? "",
    [validators]
  );

  const setValue = useCallback(
    (name, value) => {
      setValues(previous => {
        const next = { ...previous, [name]: value };

        // Only show an error live once the field has been left at least once.
        // Validating from the first keystroke means "a" is instantly invalid,
        // which reads as hostile.
        setErrors(currentErrors =>
          touched[name]
            ? { ...currentErrors, [name]: runValidator(name, value, next) }
            : currentErrors
        );

        return next;
      });
    },
    [touched, runValidator]
  );

  const handleChange = useCallback(
    event => {
      const { name, type, checked, value } = event.target;
      setValue(name, type === "checkbox" ? checked : value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    event => {
      const { name } = event.target;
      setTouched(previous => ({ ...previous, [name]: true }));
      setErrors(previous => ({ ...previous, [name]: runValidator(name, values[name], values) }));
    },
    [values, runValidator]
  );

  const validateAll = useCallback(() => {
    const next = {};
    Object.keys(validators).forEach(name => {
      const message = runValidator(name, values[name], values);
      if (message) next[name] = message;
    });
    return next;
  }, [validators, values, runValidator]);

  const handleSubmit = useCallback(
    async event => {
      event?.preventDefault();

      const nextErrors = validateAll();
      setErrors(nextErrors);
      setTouched(Object.fromEntries(Object.keys(validators).map(name => [name, true])));

      const failed = Object.keys(nextErrors);
      if (failed.length) {
        // Move focus to the first broken field, or a keyboard user has to hunt
        document.querySelector(`[name="${failed[0]}"]`)?.focus();
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit?.(values);
        setSubmitted(true);
      } finally {
        setSubmitting(false);
      }
    },
    [validateAll, validators, values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, [initialValues]);

  // Only surface an error once the field is touched
  const fieldError = name => (touched[name] ? errors[name] : "");

  const isValid = Object.keys(validateAll()).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    submitting,
    submitted,
    isValid,
    isDirty,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    fieldError,
    // Spread onto an input: <Input {...field("email")} />
    field: name => ({
      name,
      value: values[name] ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
      error: fieldError(name)
    })
  };
}
