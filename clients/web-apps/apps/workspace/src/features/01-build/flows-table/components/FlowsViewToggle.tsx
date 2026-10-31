import { Button } from "@avplatform/ui/buttons";
import { LayoutGrid, List } from "lucide-react";

import { FlowsViewMode } from "../hooks/useFlowsView";

interface FlowsViewToggleProps {
  view: FlowsViewMode;
  onChange: (view: FlowsViewMode) => void;
}

/**
 * Segmented control to switch the Agents list between grid and table views.
 */
export const FlowsViewToggle = ({ view, onChange }: FlowsViewToggleProps) => {
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
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="icon8"
        className="size-[26px]"
        aria-label="Table view"
        aria-pressed={view === "table"}
        onClick={() => onChange("table")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
