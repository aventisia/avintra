import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { cn } from "@avplatform/ui/lib";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./Chart.ee";

interface ModelChartDataPoint {
  date: string;
  [seriesKey: string]: string | number;
}

interface ModelChartSeries {
  key: string;
  label: string;
  color: string;
}

interface ModelChartProps {
  title: string;
  /** Optional label shown under the title, e.g. total credits. */
  label?: string;
  /** Merged timeline across all token-type series (one object per date). */
  data: ModelChartDataPoint[];
  /** Series to render as stacked bars (e.g. input / output / cached). */
  series: ModelChartSeries[];
  className?: string;
}

/**
 * Renders a single stacked bar chart for one model, with each token type
 * (input / output / cached) shown as a different colored series.
 */
export function ModelChart({ title, label, data, series, className }: ModelChartProps) {
  const chartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  return (
    <Card className={cn("py-0", className)}>
      <CardHeader className="!px-8 !pb-0 !pt-6">
        <CardTitle>{title}</CardTitle>
        {label && <CardDescription>{label}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  hideIndicator={true}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} stackId="model" fill={s.color} barSize={12} />
            ))}
            {series.length > 1 && (
              <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
