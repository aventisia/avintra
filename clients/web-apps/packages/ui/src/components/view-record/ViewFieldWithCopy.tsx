import { CopyableText } from "@avplatform/ui";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import type { ComponentProps } from "react";

/**
 * Props for the {@link ViewFieldWithCopy} component.
 *
 * Extends all {@link CopyableText} props (except `value`, which is made
 * nullable) and adds a `label` displayed above the copyable value.
 */
type ViewFieldWithCopyProps = Omit<ComponentProps<typeof CopyableText>, "value"> & {
  /** Label displayed above the copyable value. */
  label: string;
  /** The value to display and copy. Renders {@link FALLBACK_VALUE} when `null` or `undefined`. */
  value: string | null | undefined;
};

/**
 * Renders a labelled field with an inline copy-to-clipboard button inside a styled card container.
 *
 * @example
 * <ViewFieldWithCopy label="OS Unique Id" value={machine.osID} ariaLabel="copy os id" />
 * <ViewFieldWithCopy label="IP Address" value={machine.ipAddress} textClassName="font-mono" />
 */
export const ViewFieldWithCopy = ({
  label,
  value,
  className,
  textClassName,
  ...props
}: ViewFieldWithCopyProps) => {
  return (
    <div className="rounded-md border border-line bg-sunken px-3 py-2.5">
      <p className="font-mono text-[10.5px]/[14px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </p>
      <CopyableText
        className={cn("mt-0.5 w-full", className)}
        textClassName={cn("text-sm font-medium", textClassName)}
        value={value ?? FALLBACK_VALUE}
        {...props}
      />
    </div>
  );
};
