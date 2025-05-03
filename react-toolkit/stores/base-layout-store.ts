import { create } from "zustand";

/**
 * Interface representing the state and actions for managing the base layout of the application.
 */
interface BaseLayoutStore {
  /**
   * Indicates whether the sidebar is expanded or collapsed.
   */
  sidebarExpand: boolean;

  /**
   * Determines whether the navbar is displayed on a sheet when open.
   */
  navbarOnSheetOpen: boolean;

  /**
   * Indicates whether the notification panel is open.
   */
  notificationOpen: boolean;

  /**
   * Indicates whether the user heading popover is open in the right corner.
   */
  isPopOverOpen: boolean;

  /**
   * Updates the state of the sidebar expansion.
   * @param sidebarExpand - A boolean indicating the new state of the sidebar.
   */
  setSidebarExpand: (sidebarExpand: boolean) => void;

  /**
   * Updates the state of the navbar when displayed on a sheet.
   * @param navbarOnSheetOpen - A boolean indicating the new state of the navbar on the sheet.
   */
  setNavbarOnSheetOpen: (navbarOnSheetOpen: boolean) => void;

  /**
   * Updates the state of the notification panel.
   * @param notificationOpen - A boolean indicating the new state of the notification panel.
   */
  setNotificationOpen: (notificationOpen: boolean) => void;

  /**
   * Updates the state of the user heading popover in the right corner.
   * @param isOpen - A boolean indicating the new state of the popover.
   */
  setIsPopOverOpen: (isOpen: boolean) => void;
}

const useBaseLayoutStore = create<BaseLayoutStore>((set) => ({
  // Initial state
  sidebarExpand: true,
  isTauri: "isTauri" in window,
  navbarOnSheetOpen: false,
  notificationOpen: false,
  isPopOverOpen: false,

  // Methods for manipulating state
  setSidebarExpand: (newValue: boolean) =>
    set((state) => ({ ...state, sidebarExpand: newValue })),

  setNavbarOnSheetOpen: (newValue: boolean) =>
    set((state) => ({ ...state, navbarOnSheetOpen: newValue })),

  setNotificationOpen: (newValue: boolean) =>
    set((state) => ({ ...state, notificationOpen: newValue })),

  setIsPopOverOpen: (newValue: boolean) =>
    set((state) => ({ ...state, isPopOverOpen: newValue })),
}));

export { useBaseLayoutStore };
