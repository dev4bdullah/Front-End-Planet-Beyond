/* Pure functions — each returns "" when valid, or the message to display. */

export const required = label => value => (String(value).trim() ? "" : `${label} is required.`);

export const minLength = (label, min) => value =>
  String(value).trim().length >= min ? "" : `${label} needs at least ${min} characters.`;

export const email = value => {
  const text = String(value).trim();
  if (!text) return "Email is required.";
  if (!text.includes("@")) return "Missing an @ sign.";
  const [local, domain] = text.split("@");
  if (!local || !domain) return "Needs text either side of the @.";
  if (!domain.includes(".")) return "The domain needs a dot.";
  return "";
};

export const password = value => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[0-9]/.test(value)) return "Include at least one number.";
  return "";
};

export const matches = (otherField, label) => (value, allValues) =>
  value === allValues[otherField] ? "" : `${label} do not match.`;

export const positiveNumber = label => value => {
  if (value === "" || value === null) return `${label} is required.`;
  const number = Number(value);
  if (Number.isNaN(number)) return "Enter a number.";
  if (number <= 0) return "Must be greater than zero.";
  return "";
};

export const compose =
  (...rules) =>
  (value, allValues) => {
    for (const rule of rules) {
      const message = rule(value, allValues);
      if (message) return message;
    }
    return "";
  };
