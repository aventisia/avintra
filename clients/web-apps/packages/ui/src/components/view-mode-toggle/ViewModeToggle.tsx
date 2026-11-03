import { ListIcon, SquaresFourIcon } from "@phosphor-icons/react";

import { Button } from "@/ui/components/buttons";

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
    <div className="flex h-8 items-center gap-0.5 rounded-lg border p-0.5">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="icon8"
        className="size-[26px]"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
      >
        <SquaresFourIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="icon8"
        className="size-[26px]"
        aria-label="Table view"
        aria-pressed={view === "table"}
        onClick={() => onChange("table")}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
