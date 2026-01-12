import { create } from "zustand";

interface useGAAuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clear: () => void;
}

export const useGAAuthStore = create<useGAAuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  clear: () => set({ token: null }),
}));
