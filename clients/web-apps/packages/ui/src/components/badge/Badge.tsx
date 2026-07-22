import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { badgeVariants } from "@/ui/components/badge";
import { cn } from "@/ui/lib";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * A functional React component that renders a badge element with customizable styles.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
