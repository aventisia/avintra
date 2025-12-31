import { create } from "zustand";

import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

type State = {
  /** filtered data of support tickets */
  filteredData: SupportTicketsTableDto[] | [];

  /** selected support ticket */
  selectedSupportTicket: SupportTicketsTableDto | null;

  /** Flag to check if selected support ticket data changed */
  isSelectedSTDataChanged: boolean;

  /** remarks query key for support ticket remarks */
  remarksQueryKey: string[];
};

type Actions = {
  /** Set support tickets store state*/
  setSupportTicketsState: (
    filteredData: SupportTicketsTableDto[],
    selectedSupportTicket: SupportTicketsTableDto | null,
    isSelectedSTDataChanged: boolean,
  ) => void;
};

export const useSupportTicketsTableStore = create<State & Actions>((set) => ({
  filteredData: [],
  selectedSupportTicket: null,
  isSelectedSTDataChanged: false,
  remarksQueryKey: [],

  setSupportTicketsState: (
    filteredData,
    selectedSupportTicket,
    isSelectedSTDataChanged,
  ) =>
    set(() => ({
      filteredData,
      selectedSupportTicket,
      isSelectedSTDataChanged,
      remarksQueryKey: ["remarks", selectedSupportTicket?.id ?? ""],
    })),
}));
