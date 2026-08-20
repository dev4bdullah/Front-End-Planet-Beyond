# Task 6 — Charts & Analytics

> Sheet description: Add basic charts for trends, category breakdowns, and dashboard summaries

## Four charts

| Chart | Answers |
|-------|---------|
| Area + target line | Are we above or below plan? |
| Horizontal bars | Which category is biggest? (ranking) |
| Donut | What share of the total? |
| Vertical bars | How many orders per month? |

Bars and the donut show the *same* numbers deliberately — they answer different questions, and
picking the wrong one is the most common charting mistake.

Orders use bars rather than a line because they're counts. A line implies values between the points
exist.

## Shared axis and tooltip styling

`AXIS` and `TOOLTIP` are declared once in `components/charts.jsx`, so four charts don't repeat them.
Colours come from the Tailwind tokens as `var(--color-brand-500)`, which is what makes dark mode work
without a second chart configuration.

## Three recharts traps

**The blank chart.** `ResponsiveContainer` measures its parent. If the parent has no real height,
the chart is zero pixels tall and renders nothing — no error, no warning. `ChartCard` sets an
explicit `height` for exactly this reason.

**Gradient ids are global to the document.** Two charts sharing an id silently share the gradient.

**recharts is large** — ~420kB before gzip in this project's build output. Task 8 lazy-loads this
page for that reason, and task 4 draws its sparklines by hand rather than importing it.

## Not everything needs a chart

The traffic sources section is a table. Five rows of two numbers, where the reader wants to compare
exact conversion rates — bars make that harder, not easier.

## Accessibility

An SVG is invisible to a screen reader. The subtitle on the revenue card states the growth figure in
words, which is the minimum. A full solution would add a visually-hidden data table.
