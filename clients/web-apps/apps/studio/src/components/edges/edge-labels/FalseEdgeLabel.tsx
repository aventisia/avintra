import { Badge } from "@avplatform/ui/badge";
import { XCircleIcon } from "@heroicons/react/24/outline";

export const FalseEdgeLabel = () => {
  return (
    <Badge className="nodrag nopan gap-0.5 border-orange-300 bg-orange-200 px-1.5 py-[0.2rem] text-orange-600">
      <XCircleIcon className="h-3.5 w-3.5 stroke-[2]" />
      False
    </Badge>
  );
};
