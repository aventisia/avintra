import { create } from "zustand";

interface AuthStore {
  navDirection: string;
  setNavDirection: (navDirection: string) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  navDirection: "forward",

  // Methods for manipulating state
  setNavDirection: (newValue: string) =>
    set((state) => ({ ...state, navDirection: newValue })),
}));

export { useAuthStore };
