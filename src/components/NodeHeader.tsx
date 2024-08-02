import { Badge } from "@/react-toolkit/ui/badge/badge";
import { memo } from "react";

interface NodeHeaderProps {
  iconSrc: string;
  label: string;
  category: string;
}

/**
 * Renders a icon, label and category for the Node component.
 */
export const NodeHeader = memo(
  ({ iconSrc, label, category }: NodeHeaderProps) => {
    return (
      <div className="flex items-center justify-between gap-3">
        {/* Node icon */}
        <img className="h-3.5" src={iconSrc} />

        {/* Node label */}
        <h2 className="grow truncate text-left text-sm font-medium text-slate-900">
          {label}
        </h2>

        {/* Node category */}
        <Badge className="bg-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-500">
          {category}
        </Badge>
      </div>
    );
  },
);
