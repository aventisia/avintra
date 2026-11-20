import { WarningIcon } from "@phosphor-icons/react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

/** Top-center alert shown when the open flow is shared View-only. */
export const ViewOnlyBanner = () => {
  const accessType = useCurrentFlowStore((state) => state.currentFlow.accessType);

  if (accessType !== "View") return null;

  return (
    <div className="pointer-events-none flex items-center gap-2 rounded-md border border-warn/35 bg-warn/10 px-3 py-1.5 text-xs font-medium text-ink shadow-pop">
      <WarningIcon className="h-3.5 w-3.5 text-warn" />
      <span>You are in View-only mode. Changes will not be saved.</span>
    </div>
  );
};
