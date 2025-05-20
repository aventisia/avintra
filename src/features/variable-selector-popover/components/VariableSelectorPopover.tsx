import {
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/ui/popover";

import { PopoverWrapper } from "@/react-toolkit/ui/popover/PopoverWrapper";
import VariableSelectorPopoverTrigger from "./VariableSelectorPopoverTrigger";
import VariablePopoverContent from "./variable-popover-content/VariablePopoverContent";
import React, { useState } from "react";
import { cn } from "@aventisia/ui/lib";

export const VariableSelectorPopover = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverContent>) => {
  const [isPopoverOpen, togglePopoverOpen] = useState<boolean>(false);

  return (
    <PopoverWrapper
      open={isPopoverOpen}
      onOpenChangeFn={() => togglePopoverOpen(!isPopoverOpen)}
    >
      <VariableSelectorPopoverTrigger />
      <PopoverContent
        align="end"
        variant={"responsive"}
        className={cn(className, "max-h-80")}
        {...props}
      >
        <PopoverDefaultHeader
          heading={"{X} Variables"}
          className="border-none"
        />
        <VariablePopoverContent togglePopover={togglePopoverOpen} />
      </PopoverContent>
    </PopoverWrapper>
  );
};

export default VariableSelectorPopover;
