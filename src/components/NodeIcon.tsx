import { cn } from "@/react-toolkit/lib/utils";
import { memo } from "react";

interface NodeIconProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string;
}

/**
 * Renders a icon Node component.
 */
export const NodeIcon = memo(({ className, src, ...props }: NodeIconProps) => {
  return <img src={src} className={cn("h-3.5", className)} {...props} />;
});
