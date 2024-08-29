import { create } from "zustand";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

type State = {
  /** filtered data of support tickets */
  filteredData: SupportTicketsTableDto[] | [];

  selectedSupportTicket: SupportTicketsTableDto | null;
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

  setSupportTicketsState: (filteredData, selectedSupportTicket) =>
    set(() => ({
      filteredData,
      selectedSupportTicket,
    })),
}));
