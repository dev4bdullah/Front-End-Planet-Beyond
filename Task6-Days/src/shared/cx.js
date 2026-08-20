/* Falsy values drop out, so conditional classes never leave stray spaces
   or the literal word "false" in the class attribute. */
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
