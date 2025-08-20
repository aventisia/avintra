import { Button } from "@aventisia/ui/buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { barChartData } from "../constants/bar-chart-data";
import { ChartBarInteractive } from "../shared/charts/BarChart";

const ServiceCharts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2); // 🆕

  //   const items = useMemo(() => data?.data ?? [], [data]);
  const items = useMemo(() => new Array(10).fill(null) ?? [], []);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [currentPage, items, itemsPerPage]);

  console.log(currentItems);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 px-6 py-6">
        {currentItems.map(() => {
          return (
            <ChartBarInteractive title="ElevenLabs STT" data={barChartData} />
          );
        })}
      </div>

      {/* Pagination */}
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
              {[2, 4, 6, 10, 20, 40, 50].map((pageSize) => (
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
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
    </div>
  );
};

export default ServiceCharts;
