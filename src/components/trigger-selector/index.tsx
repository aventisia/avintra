import { Popover, PopoverContent } from "@/react-toolkit/ui/popover/Popover";
import React from "react";
import { TriggerSelectorContent } from "./TriggerSelectorContent";
import { OpenTriggerSelector } from "./OpenTriggerSelector";

/**
 * Renders the Trigger Selector (to replace flow trigger).
 */
export const TriggerSelector = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverContent>) => {
  return (
    <Popover>
      {/* Popover Trigger */}
      <OpenTriggerSelector />
      {/* Popover content */}
      <PopoverContent align="start" variant={"responsive"} {...props}>
        <TriggerSelectorContent />
      </PopoverContent>
    </Popover>
  );
};
