import { buttonVariants } from "@avplatform/ui/buttons";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { HelpPopover } from "./HelpPopover.ee";

interface HelpButtonProps {
  /** Guide id to open (see `src/docs-content/registry.ts`). */
  guideId: string;
  /** Tooltip / aria-label text (defaults to "Help"). */
  tooltip?: string;
  /** Optional className for styling/placement. */
  className?: string;
}

/**
 * An "i" affordance that opens the relevant help guide for the current page or
 * feature in a popover. Used in page headers and contextual locations across
 * the app.
 */
const HelpButton = ({ guideId, tooltip = "Help", className }: HelpButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <HelpPopover guideId={guideId} open={open} onOpenChange={setOpen}>
      <Tooltip content={tooltip}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={tooltip}
            className={buttonVariants({ variant: "ghost", size: "icon8" }) + ` ${className ?? ""}`}
          >
            <InformationCircleIcon className="h-5 w-5 text-[--icon-color]" />
          </button>
        </PopoverTrigger>
      </Tooltip>
    </HelpPopover>
  );
};

export { HelpButton };
