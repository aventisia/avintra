import { Badge } from "@avplatform/ui/badge";
import { XCircleIcon } from "@phosphor-icons/react";

export const FalseEdgeLabel = () => {
  return (
    <Badge className="nodrag nopan gap-0.5 border-bad/30 bg-bad/10 px-1.5 py-[0.2rem] text-bad">
      <XCircleIcon className="h-3.5 w-3.5" />
      False
    </Badge>
  );
};
