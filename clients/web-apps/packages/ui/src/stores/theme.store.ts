import { create } from "zustand";

type ThemeMode = "system" | "light" | "dark";

const THEME_MODES: ThemeMode[] = ["system", "light", "dark"];
const THEME_STORAGE_KEY = "av-theme-mode";
// shortcut: defaults to light until app screens drop hard-coded colors, switch to "system" after the Phase 7 cleanup
const DEFAULT_THEME_MODE: ThemeMode = "light";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const readStoredThemeMode = (): ThemeMode => {
  try {
    const storedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    return storedMode && THEME_MODES.includes(storedMode) ? storedMode : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
};

const writeStoredThemeMode = (mode: ThemeMode) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    return;
  }
};

const isDarkMode = (mode: ThemeMode) =>
  mode === "dark" || (mode === "system" && matchMedia(DARK_SCHEME_QUERY).matches);

const applyThemeMode = (mode: ThemeMode) => {
  const isDark = isDarkMode(mode);
  document.documentElement.classList.toggle("dark", isDark);
  useThemeStore.setState({ isDark });
};

interface ThemeStore {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: readStoredThemeMode(),
  isDark: isDarkMode(readStoredThemeMode()),
  setThemeMode: (themeMode) => {
    writeStoredThemeMode(themeMode);
    set({ themeMode });
    applyThemeMode(themeMode);
  },
}));

/** Applies the stored theme and follows OS changes while the mode is `system`. Call once before the first render. */
const initTheme = () => {
  applyThemeMode(useThemeStore.getState().themeMode);
  matchMedia(DARK_SCHEME_QUERY).addEventListener("change", () =>
    applyThemeMode(useThemeStore.getState().themeMode),
  );
};

export { initTheme, THEME_MODES, type ThemeMode, useThemeStore };
