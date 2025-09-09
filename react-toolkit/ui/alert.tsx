import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@aventisia/ui/lib";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[calc(var(--spacing)*4)_1fr] gap-x-3 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default:
          "border-muted text-muted-foreground bg-muted/40 dark:bg-muted/20",

        success:
          "border-green-500/50 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20 [&>svg]:text-green-500",

        destructive:
          "border-red-500/50 text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/20 [&>svg]:text-red-500",

        warning:
          "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20 [&>svg]:text-yellow-500",

        info: "border-blue-500/50 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    icon?: React.ElementType; // user-provided icon (Lucide, custom, etc.)
    title?: string;
    description?: string;
  };
export function Alert({
  className,
  variant,
  icon: Icon,
  title,
  description,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), "flex items-center", className)}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <div className="space-y-1">
        {title && <div className="font-medium tracking-tight">{title}</div>}
        {description && (
          <div
            className={cn(
              "text-sm",
              variant === "success" &&
                "text-green-700/80 dark:text-green-300/70",
              variant === "destructive" &&
                "text-red-700/80 dark:text-red-300/70",
              variant === "warning" &&
                "text-yellow-700/80 dark:text-yellow-300/70",
              variant === "info" && "text-blue-700/80 dark:text-blue-300/70",
              variant === "default" && "text-muted-foreground",
            )}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
