import { create } from "zustand";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

type State = {
  /** filtered data of support tickets */
  filteredData: SupportTicketsTableDto[] | [];

  /** selected support ticket */
  selectedSupportTicket: SupportTicketsTableDto | null;

  /** remarks query key for support ticket remarks */
  remarksQueryKey: string[];
};

type Actions = {
  /** Set support tickets store state*/
  setSupportTicketsState: (
    filteredData: SupportTicketsTableDto[],
    selectedSupportTicket: SupportTicketsTableDto | null,
  ) => void;
};

export const useSupportTicketsTableStore = create<State & Actions>((set) => ({
  filteredData: [],
  selectedSupportTicket: null,
  remarksQueryKey: [],

  setSupportTicketsState: (filteredData, selectedSupportTicket) =>
    set(() => ({
      filteredData,
      selectedSupportTicket,
      remarksQueryKey: ["remarks", selectedSupportTicket?.id ?? ""],
    })),
}));
