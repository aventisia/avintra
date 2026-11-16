import * as React from "react";

import { cn } from "@/ui/lib";

/**
 * A `Card` component that renders a styled `div` element with customizable attributes.
 *
 * This component uses `React.forwardRef` to allow forwarding of the `ref` to the underlying `div` element.
 * It supports all standard HTML attributes for a `div` element via `React.HTMLAttributes<HTMLDivElement>`.
 *
 * The purpose of this component is to provide a consistent styling for cards in the application and dark/light mode support.
 * It applies a set of default classes for rounded corners, border, background color and text color.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-line bg-surface text-ink", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

// TODO: Adding below card components temporarily till the time we remove below components from other repos

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-[14px]/5 font-semibold text-ink", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-body-sm text-ink-2", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
