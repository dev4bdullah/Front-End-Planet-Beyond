/* A skeleton should match the shape of what's coming, or the layout jumps
   when the real content arrives. */

export default function Skeleton({ width = "100%", height = "1rem", radius, count = 1 }) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className="skeleton"
      style={{ width, height, borderRadius: radius, marginBottom: count > 1 ? "0.4rem" : 0 }}
      aria-hidden="true"
    />
  ));
}
