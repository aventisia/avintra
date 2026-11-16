import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { THEME_MODES, ThemeMode, useThemeStore } from "@avplatform/ui/stores";

const themeModeLabel: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export const StudioThemeSelect = () => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  return (
    <div className="flex items-center justify-between gap-4 px-2.5 py-2">
      <label htmlFor="studio-theme" className="text-body-sm font-medium text-ink">
        Theme
      </label>
      <Select value={themeMode} onValueChange={(mode) => setThemeMode(mode as ThemeMode)}>
        <SelectTrigger id="studio-theme" size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {THEME_MODES.map((mode) => (
            <SelectItem key={mode} value={mode}>
              {themeModeLabel[mode]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
