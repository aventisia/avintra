import { Badge } from "@avplatform/ui/badge";
import React from "react";

export const BaseEdgeLabel = ({ children }: React.PropsWithChildren) => {
  return (
    <Badge className="nodrag nopan gap-0.5 border-blue-300 bg-blue-200 pl-1 pr-[0.37rem] text-blue-600">
      {children}
    </Badge>
  );
};
