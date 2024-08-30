import { create } from "zustand";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

type State = {
  /** filtered data of support tickets */
  filteredData: SupportTicketsTableDto[] | [];

  /** selected support ticket */
  selectedSupportTicket: SupportTicketsTableDto | null;

  /** selected remark id */
  selectedRemarkId: string | null;

  /** remarks query key for support ticket remarks */
  remarksQueryKey: string[];
};

type Actions = {
  /** Set support tickets store state*/
  setSupportTicketsState: (
    filteredData: SupportTicketsTableDto[],
    selectedSupportTicket: SupportTicketsTableDto | null,
    selectedRemarkId: string | null,
  ) => void;
};

export const useSupportTicketsTableStore = create<State & Actions>((set) => ({
  filteredData: [],
  selectedSupportTicket: null,
  selectedRemarkId: null,
  remarksQueryKey: [],

  setSupportTicketsState: (
    filteredData,
    selectedSupportTicket,
    selectedRemarkId,
  ) =>
    set(() => ({
      filteredData,
      selectedSupportTicket,
      selectedRemarkId,
      remarksQueryKey: ["remarks", selectedSupportTicket?.id ?? ""],
    })),
}));
