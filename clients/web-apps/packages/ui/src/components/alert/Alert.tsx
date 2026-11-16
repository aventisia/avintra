import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { alertVariants } from "@/ui/components/alert";
import { cn } from "@/ui/lib";

interface AlertProps extends React.ComponentProps<"div">, VariantProps<typeof alertVariants> {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title?: string;
  description?: string;
}

function Alert({
  className,
  variant,
  icon: Icon,
  title,
  description,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-semibold", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-body-sm text-ink-2 [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
