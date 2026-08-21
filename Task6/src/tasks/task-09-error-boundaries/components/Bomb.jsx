import { useState } from "react";
import { Button, Card } from "@ui";

/* Throws during render when armed — which is exactly what a boundary catches. */
export function RenderBomb({ armed }) {
  if (armed) {
    throw new Error("RenderBomb: cannot read property 'total' of undefined");
  }

  return (
    <Card className="text-sm">
      <p className="font-semibold">Widget rendering normally</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Arm it and this whole card is replaced by the fallback.
      </p>
    </Card>
  );
}

/* Throws inside a click handler — a boundary will NOT catch this. */
export function HandlerBomb() {
  const [caught, setCaught] = useState(null);

  return (
    <Card className="text-sm">
      <p className="font-semibold">Error inside an event handler</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        A boundary can&apos;t catch this. It needs try/catch.
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="xs"
          variant="danger"
          onClick={() => {
            // Genuinely uncaught — check the console for the red entry
            throw new Error("HandlerBomb: uncaught, straight to the console");
          }}
        >
          Throw uncaught
        </Button>

        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            try {
              JSON.parse("{ not json }");
            } catch (error) {
              setCaught(error.message);
            }
          }}
        >
          Throw and catch
        </Button>
      </div>

      {caught && (
        <p className="text-2xs text-warning-600 mt-2 font-mono">Caught safely: {caught}</p>
      )}
    </Card>
  );
}
