import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { InfoIcon } from "@phosphor-icons/react";

import { useHelpPanelStore } from "./help-panel.store";

interface HelpButtonProps {
  /** Guide id to open (see `src/docs-content/registry.ts`). */
  guideId: string;
  /** Tooltip / aria-label text (defaults to "Help"). */
  tooltip?: string;
  /** Optional className for styling/placement. */
  className?: string;
}

/**
 * An "i" affordance that opens a specific help guide in the help panel, for spots that need
 * a guide other than the current page's.
 */
const HelpButton = ({ guideId, tooltip = "Help", className }: HelpButtonProps) => {
  const openGuide = useHelpPanelStore((state) => state.openGuide);

  return (
    <Tooltip content={tooltip}>
      <Button
        variant="ghost"
        size="icon7"
        aria-label={tooltip}
        onClick={() => openGuide(guideId)}
        className={cn("text-muted-foreground", className)}
      >
        <InfoIcon className="size-4" />
      </Button>
    </Tooltip>
  );
};

export { HelpButton };
