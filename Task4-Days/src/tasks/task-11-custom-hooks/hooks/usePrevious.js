import { useEffect, useRef } from "react";

/* Holds the value from the previous render. Useful for "what changed" logging,
   and the clearest small example of a ref surviving a render without causing one. */

export function usePrevious(value) {
  const ref = useRef(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
