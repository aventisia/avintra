import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { badgeDotVariants, badgeVariants } from "@/ui/components/badge";
import { cn } from "@/ui/lib";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

type BadgeDotVariant = NonNullable<VariantProps<typeof badgeDotVariants>["variant"]>;

const BADGE_DOT_VARIANTS: readonly string[] = [
  "running",
  "completed",
  "review",
  "failed",
  "queued",
] satisfies BadgeDotVariant[];

const isDotVariant = (variant: BadgeProps["variant"]): variant is BadgeDotVariant =>
  !!variant && BADGE_DOT_VARIANTS.includes(variant);

/**
 * A functional React component that renders a badge element with customizable styles.
 * Status variants render their status dot before the children.
 */
function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {isDotVariant(variant) && (
        <span aria-hidden="true" className={badgeDotVariants({ variant })}>
          {variant === "running" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-current motion-reduce:animate-none" />
          )}
        </span>
      )}
      {children}
    </div>
  );
}

export { Badge };
