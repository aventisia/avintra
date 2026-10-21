import * as React from "react";

import { cn } from "./cn.util";
import { getPath } from "./data-table";
import { format, isDateLike } from "./format.util";
import { Skeleton, type Tone, toneForStatus } from "./primitives";

type Row = Record<string, unknown>;

/** A plotted series; a string is shorthand for `{ key }`. */
export type SeriesInput = string | { key: string; label?: string; color?: string };

type Series = { key: string; label: string; color: string };

/** Props shared by the cartesian charts. */
export type CartesianChartProps = {
  data: Row[];
  x: string;
  y: SeriesInput | SeriesInput[];
  height?: number;
  valueFormat?: (value: number) => string;
  xFormat?: (value: unknown) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  loading?: boolean;
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
};

const CHART_COLORS = Array.from({ length: 6 }, (_, index) => `var(--color-chart-${index + 1})`);

const TONE_COLORS: Record<Tone, string> = {
  neutral: "var(--color-muted-foreground)",
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-destructive)",
  info: "var(--color-info)",
};

const isStatusKey = (key: string) => /(^|\.|\$)status$/i.test(key);

const toSeries = (y: SeriesInput | SeriesInput[]): Series[] =>
  (Array.isArray(y) ? y : [y]).map((entry, index) => {
    const spec = typeof entry === "string" ? { key: entry } : entry;
    return {
      key: spec.key,
      label:
        spec.label ??
        spec.key
          .split(".")
          .pop()!
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/^./, (c) => c.toUpperCase()),
      color: spec.color ?? CHART_COLORS[index % CHART_COLORS.length],
    };
  });

const numberAt = (row: Row, key: string) => {
  const value = Number(getPath(row, key));
  return Number.isFinite(value) ? value : 0;
};

const defaultXFormat = (value: unknown) =>
  isDateLike(value)
    ? new Date(value as string).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : String(value ?? "");

const niceStep = (range: number, count: number) => {
  const rough = range / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(rough || 1));
  const fraction = rough / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * power;
};

const niceTicks = (min: number, max: number, count = 4) => {
  if (min === max) {
    max = min === 0 ? 1 : min * 1.2;
    min = Math.min(0, min);
  }
  const step = niceStep(max - min, count);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = start; tick <= end + step / 2; tick += step)
    ticks.push(Number(tick.toPrecision(12)));
  return ticks;
};

const useWidth = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(640);
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth || 640);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(120, entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
};

const Legend = ({ series }: { series: Series[] }) => (
  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
    {series.map((entry) => (
      <li key={entry.key} className="flex items-center gap-1.5">
        <span aria-hidden className="size-2.5 rounded-sm" style={{ background: entry.color }} />
        {entry.label}
      </li>
    ))}
  </ul>
);

const DataFallbackTable = ({
  data,
  x,
  series,
  xFormat,
  valueFormat,
}: {
  data: Row[];
  x: string;
  series: Series[];
  xFormat: (value: unknown) => string;
  valueFormat: (value: number) => string;
}) => (
  <table className="sr-only">
    <thead>
      <tr>
        <th scope="col">{x}</th>
        {series.map((entry) => (
          <th key={entry.key} scope="col">
            {entry.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>
          <th scope="row">{xFormat(getPath(row, x))}</th>
          {series.map((entry) => (
            <td key={entry.key}>{valueFormat(numberAt(row, entry.key))}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const ChartTooltip = ({
  left,
  title,
  rows,
}: {
  left: number;
  title: string;
  rows: { label: string; color: string; value: string }[];
}) => (
  <div
    className="pointer-events-none absolute top-2 z-10 min-w-32 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg"
    style={{ left, transform: "translateX(-50%)" }}
  >
    <p className="mb-1 font-semibold">{title}</p>
    {rows.map((row) => (
      <p key={row.label} className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span aria-hidden className="size-2 rounded-full" style={{ background: row.color }} />
          {row.label}
        </span>
        <span className="font-medium tabular-nums">{row.value}</span>
      </p>
    ))}
  </div>
);

const ChartFrame = ({
  ariaLabel,
  height,
  loading,
  empty,
  emptyText,
  className,
  children,
}: {
  ariaLabel: string;
  height: number;
  loading?: boolean;
  empty: boolean;
  emptyText: string;
  className?: string;
  children: React.ReactNode;
}) => {
  if (loading) return <Skeleton className={cn("w-full", className)} style={{ height }} />;
  if (empty) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground",
          className,
        )}
        style={{ height }}
      >
        {emptyText}
      </div>
    );
  }
  return (
    <figure aria-label={ariaLabel} className={cn("relative w-full", className)}>
      {children}
    </figure>
  );
};

const summarize = (series: Series[], data: Row[]) =>
  `Chart of ${series.map((entry) => entry.label).join(", ")} across ${data.length} points`;

const PADDING = { top: 12, right: 12, bottom: 28 };

const yAxisWidth = (ticks: number[], valueFormat: (value: number) => string) =>
  Math.min(72, Math.max(28, ...ticks.map((tick) => valueFormat(tick).length * 7 + 10)));

const labelStride = (count: number, plotWidth: number, minSpacing = 56) =>
  Math.max(1, Math.ceil(count / Math.max(1, Math.floor(plotWidth / minSpacing))));

/** Vertical (or `horizontal`) bar chart; several `y` keys render grouped or `stacked` bars. */
export const BarChart = ({
  data,
  x,
  y,
  height = 260,
  stacked = false,
  horizontal = false,
  valueFormat = (value) => format.compact(value),
  xFormat = defaultXFormat,
  showLegend,
  showGrid = true,
  loading,
  emptyText = "No data for this selection",
  ariaLabel,
  className,
}: CartesianChartProps & { stacked?: boolean; horizontal?: boolean }) => {
  const { ref, width } = useWidth();
  const [hover, setHover] = React.useState<number | null>(null);
  const series = toSeries(y);
  const totals = data.map((row) =>
    stacked
      ? series.reduce((sum, entry) => sum + numberAt(row, entry.key), 0)
      : Math.max(...series.map((entry) => numberAt(row, entry.key))),
  );
  const minimum = Math.min(
    0,
    ...data.flatMap((row) => series.map((entry) => numberAt(row, entry.key))),
  );
  const ticks = niceTicks(minimum, Math.max(0, ...totals));
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const legend = showLegend ?? series.length > 1;

  const categoryLabels = data.map((row) => xFormat(getPath(row, x)));
  const left = horizontal
    ? Math.min(140, Math.max(40, ...categoryLabels.map((label) => label.length * 6.5 + 12)))
    : yAxisWidth(ticks, valueFormat);
  const plotWidth = Math.max(10, width - left - PADDING.right);
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const valueSpan = domainMax - domainMin || 1;

  const band = (horizontal ? plotHeight : plotWidth) / Math.max(1, data.length);
  const groupInner = band * 0.72;
  const barThickness = stacked ? groupInner : groupInner / series.length;
  const valueToLength = (value: number) =>
    ((value - domainMin) / valueSpan) * (horizontal ? plotWidth : plotHeight);
  const zero = valueToLength(0);
  const stride = labelStride(data.length, plotWidth);

  return (
    <div ref={ref} className="w-full">
      <ChartFrame
        ariaLabel={ariaLabel ?? summarize(series, data)}
        height={height}
        loading={loading}
        empty={data.length === 0}
        emptyText={emptyText}
        className={className}
      >
        <svg
          width={width}
          height={height}
          aria-hidden
          onMouseLeave={() => setHover(null)}
          className="overflow-visible"
        >
          <g transform={`translate(${left},${PADDING.top})`}>
            {showGrid &&
              ticks.map((tick) => {
                const position = valueToLength(tick);
                return horizontal ? (
                  <g key={tick} transform={`translate(${position},0)`}>
                    <line y2={plotHeight} className="stroke-border" strokeDasharray="3 3" />
                    <text
                      y={plotHeight + 18}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[11px]"
                    >
                      {valueFormat(tick)}
                    </text>
                  </g>
                ) : (
                  <g key={tick} transform={`translate(0,${plotHeight - position})`}>
                    <line x2={plotWidth} className="stroke-border" strokeDasharray="3 3" />
                    <text
                      x={-8}
                      dy="0.32em"
                      textAnchor="end"
                      className="fill-muted-foreground text-[11px]"
                    >
                      {valueFormat(tick)}
                    </text>
                  </g>
                );
              })}
            {data.map((row, index) => {
              let stackOffset = zero;
              const bandStart = index * band + (band - groupInner) / 2;
              return (
                <g key={index} onMouseEnter={() => setHover(index)}>
                  <rect
                    x={horizontal ? 0 : index * band}
                    y={horizontal ? index * band : 0}
                    width={horizontal ? plotWidth : band}
                    height={horizontal ? band : plotHeight}
                    className={hover === index ? "fill-muted/60" : "fill-transparent"}
                  />
                  {series.map((entry, seriesIndex) => {
                    const value = numberAt(row, entry.key);
                    const length = Math.abs(valueToLength(value) - zero);
                    const start = stacked ? stackOffset : value >= 0 ? zero : zero - length;
                    if (stacked) stackOffset += length;
                    const offset = stacked ? bandStart : bandStart + seriesIndex * barThickness;
                    const radius = Math.min(4, barThickness / 3);
                    return horizontal ? (
                      <rect
                        key={entry.key}
                        x={start}
                        y={offset}
                        width={length}
                        height={Math.max(1, barThickness - 2)}
                        rx={radius}
                        fill={entry.color}
                      />
                    ) : (
                      <rect
                        key={entry.key}
                        x={offset}
                        y={plotHeight - start - length}
                        width={Math.max(1, barThickness - 2)}
                        height={length}
                        rx={radius}
                        fill={entry.color}
                      />
                    );
                  })}
                  {horizontal ? (
                    <text
                      x={-8}
                      y={index * band + band / 2}
                      dy="0.32em"
                      textAnchor="end"
                      className="fill-muted-foreground text-[11px]"
                    >
                      {categoryLabels[index]}
                    </text>
                  ) : (
                    index % stride === 0 && (
                      <text
                        x={index * band + band / 2}
                        y={plotHeight + 18}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[11px]"
                      >
                        {categoryLabels[index]}
                      </text>
                    )
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        {hover !== null && data[hover] && (
          <ChartTooltip
            left={horizontal ? left + plotWidth / 2 : left + hover * band + band / 2}
            title={categoryLabels[hover]}
            rows={series.map((entry) => ({
              label: entry.label,
              color: entry.color,
              value: valueFormat(numberAt(data[hover], entry.key)),
            }))}
          />
        )}
        {legend && <Legend series={series} />}
        <DataFallbackTable
          data={data}
          x={x}
          series={series}
          xFormat={xFormat}
          valueFormat={valueFormat}
        />
      </ChartFrame>
    </div>
  );
};

/** Line chart over ordered categories or dates; `area` fills beneath each line. */
export const LineChart = ({
  data,
  x,
  y,
  height = 260,
  area = false,
  valueFormat = (value) => format.compact(value),
  xFormat = defaultXFormat,
  showLegend,
  showGrid = true,
  loading,
  emptyText = "No data for this selection",
  ariaLabel,
  className,
}: CartesianChartProps & { area?: boolean }) => {
  const { ref, width } = useWidth();
  const [hover, setHover] = React.useState<number | null>(null);
  const gradientId = React.useId().replace(/:/g, "");
  const series = toSeries(y);
  const values = data.flatMap((row) => series.map((entry) => numberAt(row, entry.key)));
  const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values));
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const left = yAxisWidth(ticks, valueFormat);
  const plotWidth = Math.max(10, width - left - PADDING.right);
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const xAt = (index: number) =>
    data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth;
  const yAt = (value: number) =>
    plotHeight - ((value - domainMin) / (domainMax - domainMin || 1)) * plotHeight;
  const categoryLabels = data.map((row) => xFormat(getPath(row, x)));
  const stride = labelStride(data.length, plotWidth, 64);
  const legend = showLegend ?? series.length > 1;

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = event.clientX - bounds.left - left;
    const index = data.length <= 1 ? 0 : Math.round((position / plotWidth) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, index)));
  };

  return (
    <div ref={ref} className="w-full">
      <ChartFrame
        ariaLabel={ariaLabel ?? summarize(series, data)}
        height={height}
        loading={loading}
        empty={data.length === 0}
        emptyText={emptyText}
        className={className}
      >
        <svg
          width={width}
          height={height}
          aria-hidden
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          className="overflow-visible"
        >
          <defs>
            {series.map((entry, index) => (
              <linearGradient
                key={entry.key}
                id={`${gradientId}-${index}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={entry.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <g transform={`translate(${left},${PADDING.top})`}>
            {showGrid &&
              ticks.map((tick) => (
                <g key={tick} transform={`translate(0,${yAt(tick)})`}>
                  <line x2={plotWidth} className="stroke-border" strokeDasharray="3 3" />
                  <text
                    x={-8}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {valueFormat(tick)}
                  </text>
                </g>
              ))}
            {categoryLabels.map((label, index) =>
              index % stride === 0 ? (
                <text
                  key={index}
                  x={xAt(index)}
                  y={plotHeight + 18}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {label}
                </text>
              ) : null,
            )}
            {series.map((entry, seriesIndex) => {
              const points = data.map(
                (row, index) => `${xAt(index)},${yAt(numberAt(row, entry.key))}`,
              );
              return (
                <g key={entry.key}>
                  {area && data.length > 1 && (
                    <path
                      d={`M${xAt(0)},${yAt(Math.max(domainMin, 0))} L${points.join(" L")} L${xAt(data.length - 1)},${yAt(Math.max(domainMin, 0))} Z`}
                      fill={`url(#${gradientId}-${seriesIndex})`}
                    />
                  )}
                  <polyline
                    points={points.join(" ")}
                    fill="none"
                    stroke={entry.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {data.length === 1 && (
                    <circle
                      cx={xAt(0)}
                      cy={yAt(numberAt(data[0], entry.key))}
                      r={4}
                      fill={entry.color}
                    />
                  )}
                </g>
              );
            })}
            {hover !== null && (
              <g>
                <line
                  x1={xAt(hover)}
                  x2={xAt(hover)}
                  y2={plotHeight}
                  className="stroke-muted-foreground/40"
                />
                {series.map((entry) => (
                  <circle
                    key={entry.key}
                    cx={xAt(hover)}
                    cy={yAt(numberAt(data[hover], entry.key))}
                    r={4}
                    fill={entry.color}
                    className="stroke-card"
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}
          </g>
        </svg>
        {hover !== null && data[hover] && (
          <ChartTooltip
            left={left + xAt(hover)}
            title={categoryLabels[hover]}
            rows={series.map((entry) => ({
              label: entry.label,
              color: entry.color,
              value: valueFormat(numberAt(data[hover], entry.key)),
            }))}
          />
        )}
        {legend && <Legend series={series} />}
        <DataFallbackTable
          data={data}
          x={x}
          series={series}
          xFormat={xFormat}
          valueFormat={valueFormat}
        />
      </ChartFrame>
    </div>
  );
};

/** Line chart with filled areas. */
export const AreaChart = (props: CartesianChartProps) => <LineChart {...props} area />;

/** Donut chart of parts of a whole, with a legend showing values and shares. */
export const DonutChart = ({
  data,
  label,
  value,
  height = 220,
  centerLabel = "Total",
  centerValue,
  colorByStatus,
  valueFormat = (input) => format.number(input),
  loading,
  emptyText = "No data for this selection",
  ariaLabel,
  className,
}: {
  data: Row[];
  label: string;
  value: string;
  height?: number;
  centerLabel?: string;
  centerValue?: React.ReactNode;
  colorByStatus?: boolean;
  valueFormat?: (value: number) => string;
  loading?: boolean;
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
}) => {
  const [hover, setHover] = React.useState<number | null>(null);
  const useStatusColors = colorByStatus ?? isStatusKey(label);
  const slices = data
    .map((row, index) => {
      const sliceLabel = String(getPath(row, label) ?? "—");
      return {
        label: sliceLabel,
        value: Math.max(0, numberAt(row, value)),
        color: useStatusColors
          ? TONE_COLORS[toneForStatus(sliceLabel)]
          : CHART_COLORS[index % CHART_COLORS.length],
      };
    })
    .filter((slice) => slice.value > 0);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = height / 2 - 4;
  const inner = radius * 0.64;
  let angle = -Math.PI / 2;

  const arcs = slices.map((slice, index) => {
    const sweep = (slice.value / (total || 1)) * Math.PI * 2;
    const start = angle;
    const end = angle + sweep - (slices.length > 1 ? 0.012 : 0);
    angle += sweep;
    const large = end - start > Math.PI ? 1 : 0;
    const point = (r: number, a: number) =>
      `${radius + r * Math.cos(a)},${radius + r * Math.sin(a)}`;
    const path =
      slices.length === 1
        ? `M${point(radius, 0)} A${radius},${radius} 0 1 1 ${point(radius, Math.PI)} A${radius},${radius} 0 1 1 ${point(radius, 0)} M${point(inner, 0)} A${inner},${inner} 0 1 0 ${point(inner, Math.PI)} A${inner},${inner} 0 1 0 ${point(inner, 0)} Z`
        : `M${point(radius, start)} A${radius},${radius} 0 ${large} 1 ${point(radius, end)} L${point(inner, end)} A${inner},${inner} 0 ${large} 0 ${point(inner, start)} Z`;
    return { ...slice, path, index };
  });

  const active = hover !== null ? arcs[hover] : null;

  return (
    <ChartFrame
      ariaLabel={ariaLabel ?? `Breakdown of ${value} by ${label}`}
      height={height}
      loading={loading}
      empty={total === 0}
      emptyText={emptyText}
      className={className}
    >
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative shrink-0" style={{ width: radius * 2, height: radius * 2 }}>
          <svg
            width={radius * 2}
            height={radius * 2}
            aria-hidden
            onMouseLeave={() => setHover(null)}
          >
            {arcs.map((arc) => (
              <path
                key={arc.label}
                d={arc.path}
                fill={arc.color}
                fillRule="evenodd"
                onMouseEnter={() => setHover(arc.index)}
                className={cn(
                  "transition-opacity",
                  hover !== null && hover !== arc.index && "opacity-40",
                )}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground">
              {active ? active.label : centerLabel}
            </span>
            <span className="text-xl font-semibold text-foreground tabular-nums">
              {active ? valueFormat(active.value) : (centerValue ?? valueFormat(total))}
            </span>
          </div>
        </div>
        <ul className="min-w-40 flex-1 space-y-1.5 text-sm">
          {arcs.map((arc) => (
            <li
              key={arc.label}
              onMouseEnter={() => setHover(arc.index)}
              onMouseLeave={() => setHover(null)}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ background: arc.color }}
                />
                <span className="truncate">{arc.label}</span>
              </span>
              <span className="text-foreground tabular-nums">
                {valueFormat(arc.value)}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {format.percent(arc.value / (total || 1), 0)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  );
};

/** Tiny trend line for tables and stat tiles; `data` is numbers or rows with `y`. */
export const Sparkline = ({
  data,
  y,
  width = 96,
  height = 28,
  color = CHART_COLORS[0],
  label = "Trend",
  className,
}: {
  data: number[] | Row[];
  y?: string;
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  className?: string;
}) => {
  const values = (data as unknown[]).map((entry) =>
    typeof entry === "number" ? entry : y ? numberAt(entry as Row, y) : 0,
  );
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map(
      (entry, index) =>
        `${(index / (values.length - 1)) * width},${height - 2 - ((entry - min) / (max - min || 1)) * (height - 4)}`,
    )
    .join(" ");
  return (
    <svg width={width} height={height} role="img" aria-label={label} className={className}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};
