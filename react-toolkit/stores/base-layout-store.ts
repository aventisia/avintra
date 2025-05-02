import { create } from "zustand";

interface BaseLayoutStore {
  sidebarExpand: boolean;
  navbarOnSheetOpen: boolean;
  notificationOpen: boolean;
  confirmActionOpen: boolean;

  //*
  // store to set for user heading popover to the right corner */
  isPopOverOpen: boolean;
  setSidebarExpand: (sidebarExpand: boolean) => void;
  setNavbarOnSheetOpen: (navbarOnSheetOpen: boolean) => void;
  setNotificationOpen: (notificationOpen: boolean) => void;
  setConfirmActionOpen: (confirmActionOpen: boolean) => void;

  //*
  // store to set for user heading popover to the right corner */
  setIsPopOverOpen: (isOpen: boolean) => void;
}

const useBaseLayoutStore = create<BaseLayoutStore>((set) => ({
  // Initial state
  sidebarExpand: true,
  navbarOnSheetOpen: false,
  notificationOpen: false,
  confirmActionOpen: false,
  isPopOverOpen: false,

  // Methods for manipulating state
  setSidebarExpand: (newValue: boolean) =>
    set((state) => ({ ...state, sidebarExpand: newValue })),
  setNavbarOnSheetOpen: (newValue: boolean) =>
    set((state) => ({ ...state, navbarOnSheetOpen: newValue })),
  setNotificationOpen: (newValue: boolean) =>
    set((state) => ({ ...state, notificationOpen: newValue })),
  setConfirmActionOpen: (newValue: boolean) =>
    set((state) => ({ ...state, confirmActionOpen: newValue })),
  setIsPopOverOpen: (newValue: boolean) =>
    set((state) => ({ ...state, isPopOverOpen: newValue })),
}));

export { useBaseLayoutStore };
