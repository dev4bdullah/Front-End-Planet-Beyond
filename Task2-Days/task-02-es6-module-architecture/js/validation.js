// Each validator takes a value and returns an error string, or "" when valid.
// Returning a string rather than a boolean means the caller gets the message for free.

export function validateTitle(value) {
  const title = value.trim();
  if (!title) return "Enter a task title.";
  if (title.length < 3) return "Use at least 3 characters.";
  return "";
}

export function validatePriority(value) {
  return value ? "" : "Pick a priority.";
}
