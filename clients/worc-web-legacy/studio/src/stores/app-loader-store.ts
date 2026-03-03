import { create } from "zustand";

interface AppLoaderState {
  isLoading: boolean;
  message: string;

  showLoader: (message?: string) => void;
  hideLoader: () => void;
}

export const useAppLoaderStore = create<AppLoaderState>((set) => ({
  isLoading: false,
  message: "",

  showLoader: (message = "Loading...") =>
    set({
      isLoading: true,
      message,
    }),

  hideLoader: () =>
    set({
      isLoading: false,
      message: "",
    }),
}));
