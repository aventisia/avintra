import { Button } from "@avplatform/ui/buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { ServiceTypeEnum } from "@/features/06-super-admin/credit-plans-table/enums/service-type-enum.ee";

import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary.ee";
import { ModelChart } from "../shared/charts/ModelChart.ee";

/** Token type suffixes recognised in the service type names (lower-case). */
const TOKEN_SUFFIXES = ["input", "output", "cached"] as const;

type TokenType = (typeof TOKEN_SUFFIXES)[number];

/** Colors used for the token-type series within each model chart. */
const TOKEN_COLORS: Record<TokenType, string> = {
  input: "hsl(241, 78%, 66%)",
  output: "hsl(168, 76%, 42%)",
  cached: "hsl(30, 92%, 55%)",
};

const TOKEN_LABELS: Record<TokenType, string> = {
  input: "Input",
  output: "Output",
  cached: "Cached",
};

interface ModelGroup {
  /** Base model name (e.g. "GPT 5.1"). */
  name: string;
  /** Total credits across all token types. */
  totalCredits: number;
  /** One series per token type present for this model. */
  series: {
    type: TokenType;
    label: string;
    color: string;
    timeline: { date: string; totalCount: number }[];
  }[];
}

/**
 * Strips the token-type suffix (e.g. "-input", "-output", "-cached") from a
 * service type label to derive the base model name and token type.
 * Returns `null` when the label has no recognised suffix (embeddings, TTS, etc).
 */
function parseModelLabel(label: string): { name: string; type: TokenType } | null {
  for (const suffix of TOKEN_SUFFIXES) {
    const marker = `-${suffix}`;
    if (label.toLowerCase().endsWith(marker)) {
      return {
        name: label.slice(0, label.length - marker.length),
        type: suffix,
      };
    }
  }
  return null;
}

/**
 * Merges the per-token-type timelines for a model into a single array of
 * date-keyed objects, each holding one numeric value per token type.
 */
function mergeTimelines(series: ModelGroup["series"]): Record<string, Record<TokenType, number>> {
  const byDate: Record<string, Record<TokenType, number>> = {};
  for (const s of series) {
    for (const point of s.timeline) {
      const bucket = (byDate[point.date] ??= {} as Record<TokenType, number>);
      bucket[s.type] = (bucket[s.type] ?? 0) + point.totalCount;
    }
  }
  return byDate;
}

/**
 * Renders a stacked bar chart per model, with each token type (input / output /
 * cached) shown as a different colored series. Previously these were separate
 * charts per token type.
 */
const ModelCharts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { data } = useFetchCreditUsageSummary();

  const modelGroups = useMemo(() => {
    const resources = (data?.data.resourceUsages ?? []).filter((item) => !item.isExecution);

    const groups = new Map<string, ModelGroup>();

    for (const item of resources) {
      const label =
        ServiceTypeEnum[item.serviceType as keyof typeof ServiceTypeEnum] ?? item.serviceType;
      const parsed = parseModelLabel(label);

      if (parsed) {
        // Token-based model: group under the base model name.
        let group = groups.get(parsed.name);
        if (!group) {
          group = { name: parsed.name, totalCredits: 0, series: [] };
          groups.set(parsed.name, group);
        }
        group.totalCredits += item.totalCredits;
        const existing = group.series.find((s) => s.type === parsed.type);
        if (existing) {
          existing.timeline = existing.timeline.concat(item.usageTimeline ?? []);
        } else {
          group.series.push({
            type: parsed.type,
            label: TOKEN_LABELS[parsed.type],
            color: TOKEN_COLORS[parsed.type],
            timeline: item.usageTimeline ?? [],
          });
        }
      } else {
        // Non-token resource (embeddings, TTS/STT, etc): render as a single series.
        groups.set(label, {
          name: label,
          totalCredits: item.totalCredits,
          series: [
            {
              type: "input",
              label: "Credits",
              color: TOKEN_COLORS.input,
              timeline: item.usageTimeline ?? [],
            },
          ],
        });
      }
    }

    return Array.from(groups.values());
  }, [data]);

  const totalPages = Math.ceil(modelGroups.length / itemsPerPage);

  const currentGroups = useMemo(() => {
    const sorted = [...modelGroups].sort((a, b) => b.totalCredits - a.totalCredits);
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [currentPage, modelGroups, itemsPerPage]);

  return (
    <div className="min-h-[33vh] rounded-lg pb-4">
      <div className="grid grid-cols-2 gap-4">
        {currentGroups.map((group) => {
          const merged = mergeTimelines(group.series);
          const chartData = Object.entries(merged)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, values]) => ({ date, ...values }));

          return (
            <ModelChart
              key={group.name}
              title={group.name}
              label={`Total credits: ${group.totalCredits.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}`}
              data={chartData}
              series={group.series.map((s) => ({
                key: s.type,
                label: s.label,
                color: s.color,
              }))}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {currentGroups.length > 0 && (
        <div className="mt-5 flex items-center justify-end space-x-6 lg:space-x-8">
          <div className="hidden items-center space-x-2 xs:flex">
            <p className="whitespace-nowrap text-hint text-muted-foreground">Charts per page</p>
            <Select
              value={`${itemsPerPage}`}
              onValueChange={(value) => {
                const newSize = Number(value);
                setItemsPerPage(newSize);
                setCurrentPage(1); // Optional: Reset to first page when changing size
              }}
            >
              <SelectTrigger className="h-8 w-[4rem]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top" className="min-w-[4rem]">
                {[10, 20, 50, 100, 200, 500, 1000].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center whitespace-nowrap text-hint text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              <CaretDoubleLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <CaretLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <CaretRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <CaretDoubleRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelCharts;
