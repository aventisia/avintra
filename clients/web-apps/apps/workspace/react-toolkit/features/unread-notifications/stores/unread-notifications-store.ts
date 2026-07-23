import { create } from "zustand";

type State = {
  /** To manage notification dialog open/close state */
  isOpen: boolean;

  /** Count of unread notifications */
  unreadCount: number;
};

type Actions = {
  /** To toggle notification dialog open/close state */
  toggleOpen: (value?: boolean) => void;

  /** Set unread notifications count */
  setUnreadCount: (count?: number) => void;
};

export const useUnreadNotificationsStore = create<State & Actions>((set) => ({
  isOpen: false,
  unreadCount: 0,

  toggleOpen: (value) =>
    set((state) => ({
      isOpen: typeof value === "boolean" ? value : !state.isOpen,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
}));
