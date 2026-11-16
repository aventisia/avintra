export type ChartType = "bar" | "line" | "area" | "pie";

export type ChartSpec = {
  type: ChartType;
  title?: string;
  /** Data key holding each row's category or x value. */
  x: string;
  /** Data keys plotted as series; a pie uses the first. */
  series: string[];
  data: Record<string, string | number>[];
};

const CHART_TYPES: readonly string[] = ["bar", "line", "area", "pie"];
/** Categorical slots the palette validates; more series than this are dropped. */
export const CHART_SERIES_LIMIT = 8;
const CHART_ROW_LIMIT = 500;

const isRow = (value: unknown): value is Record<string, string | number> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.values(value).every((cell) => typeof cell === "string" || typeof cell === "number");

/** Reads a ```chart fence's JSON; null while it is incomplete or when it isn't a chart. */
export const parseChartSpec = (code: string): ChartSpec | null => {
  let raw: unknown;
  try {
    raw = JSON.parse(code);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const { type, title, x, series, data } = raw as Record<string, unknown>;
  if (typeof type !== "string" || !CHART_TYPES.includes(type) || typeof x !== "string") return null;
  if (!Array.isArray(series) || !series.every((key) => typeof key === "string")) return null;
  if (!Array.isArray(data) || data.length === 0 || data.length > CHART_ROW_LIMIT) return null;
  if (!data.every(isRow) || series.length === 0) return null;
  return {
    type: type as ChartType,
    title: typeof title === "string" ? title : undefined,
    x,
    series: (series as string[]).slice(0, type === "pie" ? 1 : CHART_SERIES_LIMIT),
    data,
  };
};
