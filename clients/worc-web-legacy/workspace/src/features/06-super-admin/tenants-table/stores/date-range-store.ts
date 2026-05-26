import { subDays } from "date-fns";
import { create } from "zustand";

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface dateRangePickerState {
  dateRange: DateRange | undefined;
}

interface dateRangePickerActions {
  setDateRange: (range: DateRange | undefined) => void;
}

const today = new Date();
const last30Day = subDays(today, 29); // Includes today as the 30 day

export const useDateRangePickerStore = create<
  dateRangePickerState & dateRangePickerActions
>((set) => ({
  dateRange: {
    from: last30Day,
    to: today,
  },
  setDateRange: (range) => set({ dateRange: range }),
}));
