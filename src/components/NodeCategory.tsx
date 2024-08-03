import { Badge } from "@/react-toolkit/ui/badge/badge";
import { memo } from "react";

/**
 * Renders category badge for the Node component.
 */
export const NodeCategory = memo(({ children }: React.PropsWithChildren) => {
  return (
    <Badge className="bg-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-500">
      {children}
    </Badge>
  );
});
