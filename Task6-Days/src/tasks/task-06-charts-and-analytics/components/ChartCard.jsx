import { Card } from "@ui";

/* Every chart needs the same wrapper: a titled card and a fixed-height box.
   Recharts' ResponsiveContainer measures its parent, so the parent must have a
   real height — a percentage height on a container with no height renders nothing,
   which is the single most common recharts problem. */

export default function ChartCard({ title, subtitle, actions, height = 260, children }) {
  return (
    <Card>
      <Card.Header title={title} subtitle={subtitle} actions={actions} />
      <Card.Body>
        <div style={{ height }} className="w-full">
          {children}
        </div>
      </Card.Body>
    </Card>
  );
}
