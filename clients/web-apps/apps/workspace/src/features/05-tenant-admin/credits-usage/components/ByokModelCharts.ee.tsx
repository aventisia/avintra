import { Button } from "@avplatform/ui/buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { IByokModelUsage, IByokProviderUsage } from "../dtos/byok-usage-dto.ee";
import { useFetchByokUsageSummary } from "../hooks/useFetchByokUsageSummary.ee";
import { ModelChart } from "../shared/charts/ModelChart.ee";
import { useByokProviderStore } from "../store/byok-provider-store.ee";

/** Color used for the single consumption series within each model chart. */
const CONSUMPTION_COLOR = "hsl(241, 78%, 66%)";

const SERIES_KEY = "consumption";

/** Reads the summary response's provider list (or []). */
const providersFromData = (data: {
  data?: { providers?: IByokProviderUsage[] };
}): IByokProviderUsage[] => data?.data?.providers ?? [];

/**
 * Renders a model-provider selector plus one chart per model for the selected
 * provider. Each model is grouped under its provider so charts never mix
 * different unit types (tokens vs seconds vs characters).
 */
const ByokModelCharts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { data } = useFetchByokUsageSummary();
  const { selectedProvider, setSelectedProvider } = useByokProviderStore();

  const providers = useMemo(() => providersFromData(data ?? {}), [data]);

  // Keep the selected provider in sync with the data (e.g. after a date change).
  const activeProvider = providers.find((p) => p.provider === selectedProvider)?.provider ?? null;

  const models = useMemo<IByokModelUsage[]>(() => {
    if (!activeProvider) return [];
    return providers.find((p) => p.provider === activeProvider)?.models ?? [];
  }, [activeProvider, providers]);

  const totalPages = Math.ceil(models.length / itemsPerPage);

  const currentModels = useMemo(() => {
    const sorted = [...models].sort((a, b) => b.totalConsumption - a.totalConsumption);
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [currentPage, models, itemsPerPage]);

  return (
    <div className="min-h-[33vh] rounded-lg pb-4">
      {/* Model Provider selector */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-surface px-6 py-4">
        <p className="text-sm font-medium">Model Provider</p>
        <Select
          value={activeProvider ?? ""}
          onValueChange={(value) => {
            setSelectedProvider(value || null);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[16rem]">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent side="top" className="min-w-[16rem]">
            {providers.map((p) => (
              <SelectItem key={p.provider} value={p.provider}>
                {p.provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Per-model charts for the selected provider */}
      {activeProvider && (
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface px-6 py-6">
          {currentModels.map((model) => (
            <ModelChart
              key={model.model}
              title={model.model}
              label={`Total consumption: ${model.totalConsumption.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })} ${model.unitType ?? ""}`.trim()}
              data={(model.usageTimeline ?? []).map((point) => ({
                date: point.date,
                [SERIES_KEY]: point.totalCount,
              }))}
              series={[
                {
                  key: SERIES_KEY,
                  label: model.unitType ?? "Consumption",
                  color: CONSUMPTION_COLOR,
                },
              ]}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {currentModels.length > 0 && (
        <div className="mt-5 flex items-center justify-end space-x-6 px-6 lg:space-x-8">
          <div className="hidden items-center space-x-2 xs:flex">
            <p className="text-sm font-medium">Charts per page</p>
            <Select
              value={`${itemsPerPage}`}
              onValueChange={(value) => {
                const newSize = Number(value);
                setItemsPerPage(newSize);
                setCurrentPage(1);
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
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
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
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ByokModelCharts;
