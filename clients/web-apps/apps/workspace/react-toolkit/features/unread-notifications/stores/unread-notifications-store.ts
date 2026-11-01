import { create } from "zustand";

type State = {
  /** Count of unread notifications */
  unreadCount: number;
};

type Actions = {
  /** Set unread notifications count */
  setUnreadCount: (count?: number) => void;
};

export const useUnreadNotificationsStore = create<State & Actions>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
