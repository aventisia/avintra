import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { cn } from "@avplatform/ui/lib";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis } from "recharts";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./Chart.ee";

export const description = "An interactive line chart";

// const chartData = [
//   { date: "2024-04-01", desktop: 222, mobile: 150 },
//   { date: "2024-04-02", desktop: 97, mobile: 180 },
//   { date: "2024-04-03", desktop: 167, mobile: 120 },
//   { date: "2024-04-04", desktop: 242, mobile: 260 },
//   { date: "2024-04-05", desktop: 373, mobile: 290 },
//   { date: "2024-04-06", desktop: 301, mobile: 340 },
//   { date: "2024-04-07", desktop: 245, mobile: 180 },
//   { date: "2024-04-08", desktop: 409, mobile: 320 },
//   { date: "2024-04-09", desktop: 59, mobile: 110 },
//   { date: "2024-04-10", desktop: 261, mobile: 190 },
//   { date: "2024-04-11", desktop: 327, mobile: 350 },
//   { date: "2024-04-12", desktop: 292, mobile: 210 },
//   { date: "2024-04-13", desktop: 342, mobile: 380 },
//   { date: "2024-04-14", desktop: 137, mobile: 220 },
//   { date: "2024-04-15", desktop: 120, mobile: 170 },
//   { date: "2024-04-16", desktop: 138, mobile: 190 },
//   { date: "2024-04-17", desktop: 446, mobile: 360 },
//   { date: "2024-04-18", desktop: 364, mobile: 410 },
//   { date: "2024-04-19", desktop: 243, mobile: 180 },
//   { date: "2024-04-20", desktop: 89, mobile: 150 },
//   { date: "2024-04-21", desktop: 137, mobile: 200 },
//   { date: "2024-04-22", desktop: 224, mobile: 170 },
//   { date: "2024-04-23", desktop: 138, mobile: 230 },
// ];

// const chartConfig = {
//   views: {
//     label: "Page Views",
//   },
//   value: {
//     label: "Value",
//     color: "var(--chart-1)",
//   },
// } satisfies ChartConfig;

interface IData {
  date: string;
  totalCount: number;
}
interface ChartLineInteractiveProps {
  title: string;
  total: number;
  data: IData[];
  chartConfig?: ChartConfig;
  valueKey: string;
  className?: string;
  /** Optional average value to render as a dashed reference line on the chart. */
  average?: number;
}

export function ChartLineInteractive({
  title,
  total,
  data,
  chartConfig = {},
  valueKey,
  className,
  average,
}: ChartLineInteractiveProps) {
  const [activeChart] = useState<keyof typeof chartConfig>(valueKey);

  const showAverage = typeof average === "number" && !Number.isNaN(average);

  return (
    <Card className={cn("py-4 sm:py-0", className)}>
      <CardHeader className="!px-8 !pb-0 !pt-4">
        <CardDescription>{title}</CardDescription>
        <CardTitle>
          {total.toLocaleString("en-US", {
            maximumFractionDigits: 2,
          })}
          {showAverage && (
            <span className="ml-3 text-sm font-normal text-muted-foreground">
              Avg / day:{" "}
              {average.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              bottom: data?.length > 7 ? 12 : 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              padding={{ left: 18, right: 18 }}
              interval={0}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              hide={data?.length > 7}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
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
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={false}
            />
            {showAverage && (
              <ReferenceLine
                y={average}
                stroke="var(--muted-foreground)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
