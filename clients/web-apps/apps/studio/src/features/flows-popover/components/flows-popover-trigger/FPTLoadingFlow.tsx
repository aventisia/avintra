import { Loader2 } from "lucide-react";

/**
 * Renders a loading indicator for a flow.
 */
export const FPTLoadingFlow = () => {
  return (
    <>
      <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
      <span className="truncate text-xs">Loading flow...</span>
    </>
  );
};
