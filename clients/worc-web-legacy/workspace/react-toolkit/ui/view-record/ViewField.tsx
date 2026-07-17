import { FALLBACK_VALUE } from "@aventisia/ui/constants";
import { cn } from "@aventisia/ui/lib";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Props for the {@link ViewField} component.
 *
 * Extends native `<p>` props (excluding `children`) so any standard
 * paragraph HTML attribute can be forwarded to the value element.
 */
type ViewFieldProps = Omit<ComponentPropsWithoutRef<"p">, "children"> & {
  /** Label displayed above the value. */
  label: string;
  /** The value to display. Renders {@link FALLBACK_VALUE} when `null` or `undefined`. */
  value: string | null | undefined;
};

/**
 * Renders a labelled read-only field inside a styled card container.
 *
 * @example
 * <ViewField label="Hostname" value={machine.hostname} />
 * <ViewField label="IP Address" value={machine.ipAddress} className="font-mono" />
 */
export const ViewField = ({ label, value, className, ...props }: ViewFieldProps) => {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
      <p className="text-2xs text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 truncate text-sm font-medium", className)} {...props}>
        {value ?? FALLBACK_VALUE}
      </p>
    </div>
  );
};
