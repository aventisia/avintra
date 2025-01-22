import { create } from "zustand";

type State = {
  /** To manage notification popover open/close state */
  isPopoverOpen: boolean;

  /** Count of unread notifications */
  unreadCount: number;
};

type Actions = {
  /** To toggle notification popover open/close state */
  togglePopoverOpen: (value?: boolean) => void;

  /** Set unread notifications count */
  setUnreadCount: (count?: number) => void;
};

export const useUnreadNotificationsStore = create<State & Actions>((set) => ({
  isPopoverOpen: false,
  unreadCount: 0,

  togglePopoverOpen: (value) =>
    set((state) => ({
      isPopoverOpen: typeof value === "boolean" ? value : !state.isPopoverOpen,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
}));
