import type { IUserSessionStore } from "@/react-toolkit/types/user-session-types";

import { create } from "zustand";

interface UserSessionStore {
  userSession: IUserSessionStore | null;
  setUserSession: (userSession: IUserSessionStore | null) => void;
}

const useUserSessionStore = create<UserSessionStore>((set) => ({
  // Initial state
  userSession: null,

  // Methods for manipulating state
  setUserSession: (newValue: IUserSessionStore | null) =>
    set((state) => ({ ...state, userSession: newValue })),
}));

export { useUserSessionStore };
