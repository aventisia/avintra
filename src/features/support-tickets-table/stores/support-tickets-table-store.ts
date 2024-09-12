import { create } from "zustand";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

type State = {
  /** filtered data of support tickets */
  filteredData: SupportTicketsTableDto[] | [];

  /** selected support ticket */
  selectedSupportTicket: SupportTicketsTableDto | null;

  /** remarks query key for support ticket remarks */
  remarksQueryKey: string[];

  /** user role : Reviewer or User */
  userRole: string;
};

type Actions = {
  /** Set support tickets store state*/
  setSupportTicketsState: (
    filteredData: SupportTicketsTableDto[],
    selectedSupportTicket: SupportTicketsTableDto | null,
    userRole: string,
  ) => void;
};

export const useSupportTicketsTableStore = create<State & Actions>((set) => ({
  filteredData: [],
  selectedSupportTicket: null,
  remarksQueryKey: [],
  userRole: "Reviewer",

  setSupportTicketsState: (filteredData, selectedSupportTicket, userRole) =>
    set(() => ({
      filteredData,
      selectedSupportTicket,
      remarksQueryKey: ["remarks", selectedSupportTicket?.id ?? ""],
      userRole,
    })),
}));
