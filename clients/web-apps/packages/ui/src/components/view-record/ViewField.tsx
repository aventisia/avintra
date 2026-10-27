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
    <div className="rounded-md border border-line bg-sunken px-3 py-2.5">
      <p className="font-mono text-[10.5px]/[14px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </p>
      <div
        title={valueTitle ?? undefined}
        className={cn("mt-0.5 max-w-[15rem] truncate text-body-sm font-medium text-ink", className)}
        {...props}
      >
        {value ?? FALLBACK_VALUE}
      </div>
    </div>
  );
};
