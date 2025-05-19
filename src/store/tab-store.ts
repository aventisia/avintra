// src/stores/tab-store.ts
import { create } from "zustand";

interface TabState {
  activeTab: string;
}

interface TabActions {
    setActiveTab: (tab: string) => void;
}

export const useTabStore = create<TabState & TabActions>((set) => ({
  activeTab: "setup", // default tab
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
