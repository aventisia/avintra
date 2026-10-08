import React from "react";

import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";

import { useActionLock } from "./ActionLockContext";

type LockedActionTooltipProps = React.PropsWithChildren<{
  className?: string;
}>;

/** Shows the configured lock reason on hover while keeping disabled controls tooltip-accessible. */
export const LockedActionTooltip = ({ children, className }: LockedActionTooltipProps) => {
  const { locked, reason } = useActionLock();

  if (!locked) return <>{children}</>;

  return (
    <Tooltip content={reason}>
      <span className={cn("inline-flex", className)}>{children}</span>
    </Tooltip>
  );
};
