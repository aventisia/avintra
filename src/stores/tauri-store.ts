import { create } from "zustand";

/**
 * Interface representing the state and actions for managing the Tauri desktop application.
 */
interface TauriStore {
  /**
   * Specifies if the application is running in a Tauri environment.
   * We don't need a setter for this property as it is determined at runtime.
   * It is set to true if 'isTauri' is present in the window object.
   */
  isTauri: boolean;
}

const useTauriStore = create<TauriStore>(() => ({
  isTauri: "isTauri" in window,
}));

export { useTauriStore };
