import { create } from "zustand";

interface CompanyDetailsState {
  isOpen: boolean;
  isFormDirty: boolean;
}

interface CompanyDetailsDialogActions {
  setOpen: (open: boolean) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useCompanyDetailsDialogStore = create<
  CompanyDetailsState & CompanyDetailsDialogActions
>((set) => ({
  isOpen: false,
  isFormDirty: false,
  setOpen: (open) => set({ isOpen: open }),
  toggleFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
}));
