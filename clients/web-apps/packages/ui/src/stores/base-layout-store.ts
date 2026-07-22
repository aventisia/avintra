import { create } from "zustand";

import { type AppBannerType, type SidebarMenuSectionType, type ViteEnvVarType } from "@/ui/types";

// TODO: Change the name to useGlobalStore

/**
 * Interface representing the state and actions for managing the base layout of the application.
 */
interface BaseLayoutStore {
  /**
   * The sections of the sidebar menu.
   */
  sidebarMenuSections: SidebarMenuSectionType[];

  /**
   * Indicates whether the sidebar is expanded or collapsed.
   */
  sidebarExpand: boolean;

  /**
   * Indicates whether the sidebar is open on a dialog in mobile view.
   */
  sidebarOnDialogOpen: boolean;

  /**
   * Banner type to display at the top of the application.
   * It can be one of the following types: "update", "info", "warning", or false if no banner is needed.
   */
  appBanner: AppBannerType;

  /**
   * Indicates whether the notification panel is open.
   */
  notificationOpen: boolean;

  /**
   * Indicates whether the user heading popover is open in the right corner.
   */
  isPopOverOpen: boolean;

  /**
   * Contains the environment variables for the application.
   */
  viteEnvVars: ViteEnvVarType;

  /**
   * Updates the sections of the sidebar menu.
   * @param sidebarMenuSections - An array of SidebarMenuSectionType representing the new sections.
   */
  setSidebarMenuSections: (sidebarMenuSections: SidebarMenuSectionType[]) => void;

  /**
   * Updates the state of the sidebar expansion.
   * @param sidebarExpand - A boolean indicating the new state of the sidebar.
   */
  setSidebarExpand: (sidebarExpand: boolean) => void;

  /**
   * Updates the state of the sidebar when displayed on a dialog.
   * @param sidebarOnDialogOpen - A boolean indicating the new state of the sidebar on dialog.
   */
  setSidebarOnDialogOpen: (sidebarOnDialogOpen: boolean) => void;

  /**
   * Updates the visibility of the banner at the top of the application.
   * @param appBanner -  The type of banner to display, which can be "update", "info", "warning", or false.
   */
  setAppBanner: (appBanner: AppBannerType) => void;

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

  /**
   * Updates the environment variables for the application.
   */
  setViteEnvVars: (viteEnvVars: ViteEnvVarType) => void;
}

const useBaseLayoutStore = create<BaseLayoutStore>((set) => ({
  // Initial state
  sidebarMenuSections: [],
  sidebarExpand: true,
  sidebarOnDialogOpen: false,
  appBanner: false,
  notificationOpen: false,
  isPopOverOpen: false,
  viteEnvVars: {
    BASE_URL: "/",
    APP_NAME: "",
    COMPANY_NAME: "",
  },

  // Methods for manipulating state
  setSidebarMenuSections: (newValue: SidebarMenuSectionType[]) =>
    set((state) => ({ ...state, sidebarMenuSections: newValue })),

  setSidebarExpand: (newValue: boolean) => set((state) => ({ ...state, sidebarExpand: newValue })),

  setSidebarOnDialogOpen: (newValue: boolean) =>
    set((state) => ({ ...state, sidebarOnDialogOpen: newValue })),

  setAppBanner: (appBanner: AppBannerType) => set({ appBanner }),

  setNotificationOpen: (newValue: boolean) =>
    set((state) => ({ ...state, notificationOpen: newValue })),

  setIsPopOverOpen: (newValue: boolean) => set((state) => ({ ...state, isPopOverOpen: newValue })),

  setViteEnvVars: (viteEnvVars) => set({ viteEnvVars }),
}));

export { useBaseLayoutStore };
