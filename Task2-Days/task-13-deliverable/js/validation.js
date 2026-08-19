/* Task 8 — each validator returns an error string, or "" when valid. */

export function validateTitle(value) {
  const title = value.trim();
  if (!title) return "Enter a task title.";
  if (title.length < 3) return "Use at least 3 characters.";
  if (title.length > 80) return "Keep it under 80 characters.";
  return "";
}

export function validatePriority(value) {
  return value ? "" : "Pick a priority.";
}

export function validateDueDate(value) {
  if (!value) return "Pick a due date.";

  const picked = new Date(value);
  if (Number.isNaN(picked.getTime())) return "That isn't a valid date.";

  const limit = new Date();
  limit.setFullYear(limit.getFullYear() + 2);
  if (picked > limit) return "That's more than two years out.";

  return "";
}
