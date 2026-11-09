import { ListIcon, SquaresFourIcon } from "@phosphor-icons/react";

import { Button } from "@/ui/components/buttons";

const OPTION_CLASS_NAME =
  "size-[30px] rounded-[7px] border border-transparent text-muted-foreground hover:text-ink aria-pressed:border-line-strong/40 aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_rgb(0_0_0/0.08)] dark:aria-pressed:bg-fill";

export type ViewMode = "grid" | "table";

export type ViewModeToggleProps = {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
};

/**
 * Segmented control to switch a list between grid and table views.
 */
export const ViewModeToggle = ({ view, onChange }: ViewModeToggleProps) => {
  return (
    <div className="flex h-8 items-center rounded-lg border border-line bg-fill dark:bg-sunken">
      <Button
        variant="ghost"
        size="icon8"
        className={OPTION_CLASS_NAME}
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
      >
        <SquaresFourIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon8"
        className={OPTION_CLASS_NAME}
        aria-label="Table view"
        aria-pressed={view === "table"}
        onClick={() => onChange("table")}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
