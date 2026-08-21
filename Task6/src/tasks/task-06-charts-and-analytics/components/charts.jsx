import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency, formatNumber } from "@shared/data";

/* Shared axis and tooltip styling, so five charts don't repeat it.
   Colours come from the Tailwind tokens rather than being hard-coded twice. */

const AXIS = {
  stroke: "currentColor",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  className: "text-slate-400"
};

const TOOLTIP = {
  contentStyle: {
    borderRadius: "0.625rem",
    border: "1px solid var(--color-hairline)",
    background: "var(--color-surface)",
    fontSize: "0.75rem",
    boxShadow: "var(--shadow-pop)"
  },
  labelStyle: { fontWeight: 700, marginBottom: 2 }
};

const PIE_COLORS = [
  "var(--color-brand-600)",
  "var(--color-brand-400)",
  "var(--color-success-500)",
  "var(--color-warning-500)"
];

export function RevenueArea({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-hairline" />
        <XAxis dataKey="month" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={value => `$${value / 1000}k`} />
        <Tooltip {...TOOLTIP} formatter={value => formatCurrency(value)} />

        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-brand-600)"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
        {/* A dashed target line makes the area chart answer a question rather
            than just showing a shape */}
        <Line
          type="monotone"
          dataKey="target"
          stroke="var(--color-slate-400)"
          strokeDasharray="4 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-hairline" />
        <XAxis type="number" {...AXIS} tickFormatter={value => `$${value / 1000}k`} />
        <YAxis type="category" dataKey="name" {...AXIS} width={82} />
        <Tooltip {...TOOLTIP} formatter={value => formatCurrency(value)} />
        <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={22}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          {...TOOLTIP}
          formatter={(value, name) => [
            `${formatCurrency(value)} (${Math.round((value / total) * 100)}%)`,
            name
          ]}
        />
        <Legend
          verticalAlign="bottom"
          height={28}
          formatter={value => <span className="text-xs text-slate-500">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function OrdersBars({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-hairline" />
        <XAxis dataKey="month" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip {...TOOLTIP} formatter={value => formatNumber(value)} />
        <Bar dataKey="orders" fill="var(--color-brand-500)" radius={[5, 5, 0, 0]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
  );
}
