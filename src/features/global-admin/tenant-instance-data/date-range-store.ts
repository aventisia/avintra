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
const last7thDay = subDays(today, 6); // Includes today as the 7th day

export const useDateRangePickerStore = create<
  dateRangePickerState & dateRangePickerActions
>((set) => ({
  dateRange: {
    from: last7thDay,
    to: today,
  },
  setDateRange: (range) => set({ dateRange: range }),
}));
