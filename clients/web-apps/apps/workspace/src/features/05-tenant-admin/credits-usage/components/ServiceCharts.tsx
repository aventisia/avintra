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

import { ServiceTypeEnum } from "@/features/06-super-admin/credit-plans-table/enums/service-type-enum";

import { IResourceUsages } from "../dtos/credits-usage-dto";
import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";
import { ChartBarInteractive } from "../shared/charts/BarChart";
import { ChartConfig } from "../shared/charts/Chart";

const totalCreditsChartConfig = {
  views: {
    label: "Credits",
  },
} satisfies ChartConfig;

const ServiceCharts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 🆕
  const { data } = useFetchCreditUsageSummary();

  const items = useMemo(() => data?.data.resourceUsages ?? [], [data]);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    // Sort items by totalCredits in descending order
    const sortedItems = [...items].sort((a, b) => b.totalCredits - a.totalCredits);

    const start = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(start, start + itemsPerPage);
  }, [currentPage, items, itemsPerPage]);

  function generateServiceLabel(item: IResourceUsages) {
    const baseLabel = `Total credits: ${item.totalCredits.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;

    // Inline formatUnit logic
    const formatUnit = (unit: string) => (unit.endsWith("s") ? unit.slice(0, -1) : unit);

    if (item.credits != null && item.unitType != null) {
      return `${baseLabel} (${item.credits} ${item.credits > 1 ? "Credits" : "Credit"} per ${item.oneUnit > 1 ? item.oneUnit : ""} ${formatUnit(item.unitType)})`;
    }

    return baseLabel;
  }

  return (
    <div className="min-h-[33vh] rounded-lg pb-4">
      <div className="grid grid-cols-2 gap-4 rounded-lg bg-white px-6 py-6">
        {currentItems.map((item) => {
          return (
            <ChartBarInteractive
              key={`${item.serviceType}-${item.oneUnit}`}
              title={ServiceTypeEnum[item.serviceType as keyof typeof ServiceTypeEnum]}
              label={generateServiceLabel(item)}
              data={item.usageTimeline}
              chartConfig={totalCreditsChartConfig}
              valueKey="totalCount"
            />
          );
        })}
      </div>

      {/* Pagination */}
      {currentItems.length > 0 && (
        <div className="mt-5 flex items-center justify-end space-x-6 px-6 lg:space-x-8">
          <div className="hidden items-center space-x-2 xs:flex">
            <p className="text-sm font-medium">Charts per page</p>
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

export default ServiceCharts;
