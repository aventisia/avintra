import { Badge } from "@avplatform/ui/badge";
import { CircleCheckIcon } from "lucide-react";

export const TrueEdgeLabel = () => {
  return (
    <Badge className="nodrag nopan gap-0.5 border-ok/30 bg-ok/10 px-1.5 py-[0.2rem] text-ok">
      <CircleCheckIcon className="h-3.5 w-3.5 stroke-[2]" />
      True
    </Badge>
  );
};
