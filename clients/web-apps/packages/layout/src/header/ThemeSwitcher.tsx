import { cn } from "@avplatform/ui/lib";
import { THEME_MODES, type ThemeMode, useThemeStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { MonitorIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

const THEME_MODE_OPTIONS: Record<ThemeMode, { label: string; Icon: typeof SunIcon }> = {
  system: { label: "System", Icon: MonitorIcon },
  light: { label: "Light", Icon: SunIcon },
  dark: { label: "Dark", Icon: MoonIcon },
};

interface ThemeSwitcherProps {
  className?: string;
}

/** Segmented System / Light / Dark control, sized to sit as a row in the account menu. */
const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { themeMode, setThemeMode } = useThemeStore(
    useShallow((state) => ({
      themeMode: state.themeMode,
      setThemeMode: state.setThemeMode,
    })),
  );

  return (
    <div className={cn("flex items-center justify-between gap-3 px-3.5", className)}>
      <span className="flex items-center gap-2 text-body-sm text-ink-2">
        <SunMoonIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Theme
      </span>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="flex items-center gap-0.5 rounded-md border border-line bg-sunken p-0.5"
      >
        {THEME_MODES.map((mode) => {
          const { label, Icon } = THEME_MODE_OPTIONS[mode];
          const isSelected = mode === themeMode;
          return (
            <Tooltip key={mode} content={label}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={label}
                onClick={() => setThemeMode(mode)}
                className={cn(
                  "grid size-control-xs place-items-center rounded-sm text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink focus-visible:shadow-focus focus-visible:outline-none motion-reduce:transition-none",
                  isSelected && "bg-surface text-ink shadow-sm",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export { ThemeSwitcher };
