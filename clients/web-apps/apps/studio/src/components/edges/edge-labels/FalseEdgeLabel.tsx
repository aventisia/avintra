import { Badge } from "@avplatform/ui/badge";
import { CircleXIcon } from "lucide-react";

export const FalseEdgeLabel = () => {
  return (
    <Badge className="nodrag nopan gap-0.5 border-bad/30 bg-bad/10 px-1.5 py-[0.2rem] text-bad">
      <CircleXIcon className="h-3.5 w-3.5 stroke-[2]" />
      False
    </Badge>
  );
};
