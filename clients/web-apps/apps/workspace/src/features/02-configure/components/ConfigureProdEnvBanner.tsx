import { cn } from "@avplatform/ui/lib";
import { WarningIcon } from "@phosphor-icons/react";

import { EnvironmentBadge } from "@/features/02-configure/components/EnvironmentBadge";

/** Warning banner shown in Configure when the active environment is Prod. */
export const ConfigureProdEnvBanner = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border px-4 py-2 text-center",
        "border-warn/35 bg-warn/10 text-ink",
        className,
      )}
    >
      <WarningIcon className="h-4 w-4 shrink-0 text-warn" />
      <span className="text-xs font-medium tracking-wide">
        <span>You're in</span> <EnvironmentBadge /> <span>mode. Some actions are restricted.</span>
      </span>
    </div>
  );
};
