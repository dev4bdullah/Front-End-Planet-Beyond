/* Task 6 — validation rules derived from the schema in task 1.

   Each validator returns an error string, or "" when valid. Returning the
   message rather than a boolean means the caller gets the text for free and
   the rule lives in exactly one place. */

import { SCHEMAS } from "@model/model";

export function validateField(field, value, allValues = {}) {
  const raw = value ?? "";
  const text = String(raw).trim();

  /* ---------- required ---------- */
  if (field.required && !text) {
    return `${field.label} is required.`;
  }

  // An empty optional field is valid — every check below assumes a value
  if (!text) return "";

  /* ---------- text length ---------- */
  if (field.type === "text" || field.type === "textarea") {
    if (field.min && text.length < field.min) {
      return `${field.label} needs at least ${field.min} characters.`;
    }
    if (field.max && text.length > field.max) {
      return `${field.label} must be under ${field.max} characters.`;
    }
  }

  /* ---------- pattern ---------- */
  if (field.pattern && !field.pattern.test(text)) {
    return field.hint
      ? `${field.label} doesn't match the format. ${field.hint}`
      : `${field.label} format is wrong.`;
  }

  /* ---------- email ----------
     Deliberately not a regex from Stack Overflow. The only reliable test of an
     email address is sending mail to it; this catches typos, nothing more. */
  if (field.type === "email") {
    if (!text.includes("@")) return "Email needs an @ sign.";
    const [local, domain] = text.split("@");
    if (!local || !domain) return "Email needs text either side of the @.";
    if (!domain.includes(".")) return "Email domain needs a dot.";
    if (domain.endsWith(".")) return "Email domain can't end with a dot.";
    if (/\s/.test(text)) return "Email can't contain spaces.";
  }

  /* ---------- numbers ---------- */
  if (field.type === "number") {
    const number = Number(text);

    if (Number.isNaN(number)) return `${field.label} must be a number.`;
    if (field.integer && !Number.isInteger(number)) return `${field.label} must be a whole number.`;
    if (field.min !== undefined && number < field.min)
      return `${field.label} must be at least ${field.min}.`;
    if (field.max !== undefined && number > field.max)
      return `${field.label} must be at most ${field.max}.`;
  }

  /* ---------- dates ---------- */
  if (field.type === "date") {
    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return `${field.label} isn't a valid date.`;

    if (field.notPast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return `${field.label} can't be in the past.`;
    }
  }

  /* ---------- select ---------- */
  if (field.type === "select" && field.options && !field.options.includes(text)) {
    return `${field.label} must be one of the listed options.`;
  }

  /* ---------- cross-field ---------- */
  if (field.name === "stock" && allValues.status === "active" && Number(text) === 0) {
    return "An active product can't have zero stock — set it to draft or archived.";
  }

  return "";
}

export function validateAll(entity, values) {
  const errors = {};

  SCHEMAS[entity].fields.forEach(field => {
    const message = validateField(field, values[field.name], values);
    if (message) errors[field.name] = message;
  });

  return errors;
}

export function isValid(entity, values) {
  return Object.keys(validateAll(entity, values)).length === 0;
}
