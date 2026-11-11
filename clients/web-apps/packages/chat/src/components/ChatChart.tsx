import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type ChartSpec } from "../utils/chart-spec.util";

// Validated categorical palette (light / dark), assigned in this fixed order.
const PALETTE_CLASS =
  "[--series-1:#2a78d6] [--series-2:#eb6834] [--series-3:#1baf7a] [--series-4:#eda100] [--series-5:#e87ba4] [--series-6:#008300] [--series-7:#6250d6] [--series-8:#e34948] dark:[--series-1:#3987e5] dark:[--series-2:#d95926] dark:[--series-3:#199e70] dark:[--series-4:#c98500] dark:[--series-5:#d55181] dark:[--series-6:#008300] dark:[--series-7:#9085e9] dark:[--series-8:#e66767]";

const seriesColor = (index: number) => `var(--series-${index + 1})`;

const axisProps = {
  stroke: "var(--line)",
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false,
} as const;

const tooltipProps = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    color: "var(--ink)",
    fontSize: 13,
  },
  cursor: { fill: "var(--fill)", stroke: "var(--line-strong)" },
} as const;

const legendProps = {
  wrapperStyle: { fontSize: 12 },
  formatter: (value: string) => <span style={{ color: "var(--ink-2)" }}>{value}</span>,
} as const;

const CartesianChart = ({ spec }: { spec: ChartSpec }) => {
  const { type, x, series, data } = spec;
  const children = [
    <CartesianGrid key="grid" vertical={false} stroke="var(--line)" />,
    <XAxis key="x" dataKey={x} {...axisProps} />,
    <YAxis key="y" {...axisProps} axisLine={false} width={48} />,
    <Tooltip key="tooltip" {...tooltipProps} />,
    series.length > 1 && <Legend key="legend" {...legendProps} />,
  ];
  if (type === "line")
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {children}
          {series.map((key, index) => (
            <Line
              key={key}
              dataKey={key}
              stroke={seriesColor(index)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  if (type === "area")
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          {children}
          {series.map((key, index) => (
            <Area
              key={key}
              dataKey={key}
              stroke={seriesColor(index)}
              strokeWidth={2}
              fill={seriesColor(index)}
              fillOpacity={0.15}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={2}>
        {children}
        {series.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={seriesColor(index)}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// shortcut: a pie draws its first 8 rows only; fold the rest into "Other" if models send longer lists.
const PieView = ({ spec }: { spec: ChartSpec }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Tooltip {...tooltipProps} />
      <Legend {...legendProps} />
      <Pie
        data={spec.data.slice(0, 8)}
        dataKey={spec.series[0]}
        nameKey={spec.x}
        innerRadius="55%"
        outerRadius="85%"
        stroke="var(--surface)"
        strokeWidth={2}
      >
        {spec.data.slice(0, 8).map((_, index) => (
          <Cell key={index} fill={seriesColor(index)} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

/** Draws a chart fence's spec as a bar, line, area or pie chart. */
export const ChatChart = ({ spec }: { spec: ChartSpec }) => (
  <figure
    className={`${PALETTE_CLASS} mt-5 rounded-xl border border-line bg-surface p-4`}
    aria-label={spec.title ?? `${spec.type} chart`}
  >
    {spec.title && (
      <figcaption className="mb-3 text-sm font-medium text-ink">{spec.title}</figcaption>
    )}
    <div className="h-72 w-full">
      {spec.type === "pie" ? <PieView spec={spec} /> : <CartesianChart spec={spec} />}
    </div>
  </figure>
);
