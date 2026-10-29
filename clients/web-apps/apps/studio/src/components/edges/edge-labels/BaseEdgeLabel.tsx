import { Badge } from "@avplatform/ui/badge";
import React from "react";

export const BaseEdgeLabel = ({ children }: React.PropsWithChildren) => {
  return (
    <Badge className="nodrag nopan gap-0.5 border-line bg-selected pl-1 pr-[0.37rem] text-primary-text">
      {children}
    </Badge>
  );
};
