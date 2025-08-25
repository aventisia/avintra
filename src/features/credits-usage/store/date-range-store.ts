import { create } from "zustand";

interface dateRangePickerState {
    startDate: string;
    endDate: string;
}

interface dateRangePickerActions {
    setStartEndDate: (from: string, to: string) => void;
}

export const useDateRangePickerStore =create<dateRangePickerState & dateRangePickerActions>((set) => ({
    startDate: "",
    endDate: "",
    setStartEndDate: (from, to) => set({
        startDate: from,
        endDate: to,
    })
}));