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

export { dateRangeFilter };
