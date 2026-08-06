import { create } from "zustand";
import { TicketTableDto } from "../dtos/TicketDto";

interface TicketsTableStore {
  filteredData: TicketTableDto[];
  selectedTicket: TicketTableDto | null;
  selectedTicketId: string | null;
  isSelectedDataChanged: boolean;
  setFilteredData: (data: TicketTableDto[]) => void;
  setSelectedTicket: (ticket: TicketTableDto | null) => void;
  setSelectedTicketId: (id: string | null) => void;
  setSelectedDataChanged: (changed: boolean) => void;
}

export const useTicketsTableStore = create<TicketsTableStore>((set) => ({
  filteredData: [],
  selectedTicket: null,
  selectedTicketId: null,
  isSelectedDataChanged: false,
  setFilteredData: (data) => set({ filteredData: data }),
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
  setSelectedDataChanged: (changed) => set({ isSelectedDataChanged: changed }),
}));
