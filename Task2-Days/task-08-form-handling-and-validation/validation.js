/* Pure validators. Each returns an error string, or "" when the value is fine.
   Returning the message rather than a boolean means the caller gets the text for free. */

export function validateTitle(value) {
  const title = value.trim();
  if (!title) return "Task title is required.";
  if (title.length < 3) return "Use at least 3 characters.";
  if (title.length > 80) return "Keep it under 80 characters.";
  return "";
}

export function validatePriority(value) {
  return value ? "" : "Choose a priority.";
}

export function validateDueDate(value) {
  if (!value) return "A due date is required.";

  const picked = new Date(value);
  if (Number.isNaN(picked.getTime())) return "That isn't a valid date.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (picked < today) return "The due date can't be in the past.";

  const limit = new Date();
  limit.setFullYear(limit.getFullYear() + 2);
  if (picked > limit) return "That's more than two years out.";

  return "";
}

export function validateHours(value) {
  if (value === "") return "Estimate the hours needed.";

  const hours = Number(value);
  if (Number.isNaN(hours)) return "Enter a number.";
  if (hours <= 0) return "Must be greater than zero.";
  if (hours > 100) return "That seems too high — cap is 100.";
  return "";
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return ""; // optional field
  if (!email.includes("@")) return "Missing an @ sign.";

  const [local, domain] = email.split("@");
  if (!local || !domain) return "Needs text either side of the @.";
  if (!domain.includes(".")) return "The domain needs a dot.";
  if (/\s/.test(email)) return "No spaces allowed.";
  return "";
}
