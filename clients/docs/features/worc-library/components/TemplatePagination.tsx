import { Button } from "@/app/_components/ui/buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

type TemplatePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (size: number) => void;
};

/**
 * TemplatePagination
 *
 * Pagination controls for navigating through templates.
 * Includes current page info, items per page selector, and navigation buttons.
 */
export const TemplatePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}: TemplatePaginationProps) => {
  return (
    <div className="mt-5 flex items-center justify-end space-x-6 lg:space-x-8">
      {/* Dropdown to select number of templates per page */}
      <div className="hidden items-center space-x-2 xs:flex">
        <p className="text-sm font-medium">Templates per page</p>
        <Select
          value={`${itemsPerPage}`}
          onValueChange={(value) => {
            onItemsPerPageChange(Number(value));
          }}>
          <SelectTrigger className="h-8 w-[4rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top" className="min-w-[4rem]">
            {[6, 12, 20, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Display current page and total pages */}
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {currentPage} of {totalPages}
      </div>

      {/* Pagination navigation buttons */}
      <div className="flex items-center space-x-2">
        {/* First page button (hidden on small screens) */}
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}>
          <span className="sr-only">Go to first page</span>
          <ChevronsLeftIcon className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}>
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        {/* Next page button */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}>
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>

        {/* Last page button (hidden on small screens) */}
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}>
          <span className="sr-only">Go to last page</span>
          <ChevronsRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
