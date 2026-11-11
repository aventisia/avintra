import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@avplatform/ui/cards";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./Chart.ee";

export const description = "An interactive bar chart";

// const chartConfig = {
//   views: {
//     label: "Page Views",
//   },
//   value: {
//     label: "Value",
//     color: "var(--chart-2)",
//   },
// } satisfies ChartConfig;

interface IData {
  date: string;
  totalCount: number;
}

interface ChartBarInteractiveProps {
  title: string;
  label?: string;
  data: IData[];
  chartConfig?: ChartConfig;
  valueKey: string;
}

export function ChartBarInteractive({
  title,
  label,
  data,
  chartConfig = {},
  valueKey,
}: ChartBarInteractiveProps) {
  const [activeChart] = React.useState<keyof typeof chartConfig>(valueKey);

  return (
    <Card className="py-0">
      <CardHeader className="!px-8 !pb-0 !pt-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{label || data.length}</CardDescription>
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
            <Bar dataKey={activeChart} fill="hsl(241, 78%, 66%)" barSize={12} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
