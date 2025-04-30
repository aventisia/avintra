import { cn } from "@/react-toolkit/lib/utils";
import { badgeVariants } from "@/react-toolkit/ui/badge/badge-variants";

import { type VariantProps } from "class-variance-authority";
import * as React from "react";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
