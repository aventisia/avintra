import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Props for the {@link ViewField} component.
 *
 * Extends native `<div>` props (excluding `children`) so any standard
 * div HTML attribute can be forwarded to the value element.
 */
type ViewFieldProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  /** Label displayed above the value. */
  label: string;
  /**
   * The value to display. Can be a plain string or any ReactNode (e.g. a link,
   * badge). Renders {@link FALLBACK_VALUE} when `null` or `undefined`.
   */
  value: ReactNode | null | undefined;
};

/**
 * Renders a labelled read-only field inside a styled card container.
 *
 * @example
 * <ViewField label="Hostname" value={machine.hostname} />
 * <ViewField label="IP Address" value={machine.ipAddress} className="font-mono" />
 * <ViewField label="Agent" value={<FlowVersionNavLink ... />} />
 */
export const ViewField = ({ label, value, className, ...props }: ViewFieldProps) => {
  const valueTitle = typeof value === "string" ? value : undefined;

  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
      <p className="text-2xs text-muted-foreground">{label}</p>
      <div
        title={valueTitle ?? undefined}
        className={cn("mt-0.5 truncate max-w-[15rem] text-sm font-medium", className)}
        {...props}
      >
        {value ?? FALLBACK_VALUE}
      </div>
    </div>
  );
};
