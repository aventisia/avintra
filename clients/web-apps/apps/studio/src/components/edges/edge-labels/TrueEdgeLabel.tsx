import { Badge } from "@avplatform/ui/badge";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export const TrueEdgeLabel = () => {
  return (
    <Badge className="nodrag nopan gap-0.5 border-green-300 bg-green-100 px-1.5 py-[0.2rem] text-green-600">
      <CheckCircleIcon className="h-3.5 w-3.5 stroke-[2]" />
      True
    </Badge>
  );
};
