import { cn } from "@avplatform/ui/lib";
import { AlertTriangle } from "lucide-react";

import { EnvironmentBadge } from "@/features/02-configure/components/EnvironmentBadge";

/** Warning banner shown in Configure when the active environment is Prod. */
export const ConfigureProdEnvBanner = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border px-4 py-2 text-center",
        "border-amber-500/40 bg-amber-100/90 text-amber-800",
        className,
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      <span className="text-xs font-medium tracking-wide">
        <span>You're in</span> <EnvironmentBadge /> <span>mode. Some actions are restricted.</span>
      </span>
    </div>
  );
};
