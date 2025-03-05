import { FilterFn } from "@tanstack/react-table";
import { ModelLibraryTableDto } from "../dtos/model-library-table-dto";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";

// Define the date range filter function
const dateRangeFilter: FilterFn<ModelLibraryTableDto> = (row, _, value) => {
  // The value is the dateRange object passed by setFilterValue
  const rowDate = row.original.createdOn;
  const filterValue = value as DateRange | undefined;

  // If no date range is selected
  if (!filterValue?.from) return true;

  if (rowDate) {
    // If only from date is selected
    if (filterValue.from && !filterValue.to) {
      return rowDate >= filterValue.from;
    }

    // If both from and to dates are selected
    return isWithinInterval(rowDate, {
      start: filterValue.from,
      end: filterValue.to || filterValue.from,
    });
  } else {
    return true;
  }
};
type ModelStatus =
  | "Annotation"
  | "InTraining"
  | "Trained"
  | "InTesting"
  | "Active"
  | "Executing"
  | "Inactive";

type StatusColorMap = {
  [key in ModelStatus]: string;
};
function getModelStatusColor(status: ModelStatus) {
  const statusColors: StatusColorMap = {
    Annotation: "amber-400",
    InTraining: "indigo-500",
    Trained: "green-500",
    InTesting: "cyan-500",
    Active: "emerald-600",
    Executing: "blue-600",
    Inactive: "gray-400",
  };

  return statusColors[status] || "gray-200"; // Default fallback color
}

export { dateRangeFilter, getModelStatusColor };
