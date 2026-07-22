import { type ComponentPropsWithoutRef, forwardRef, useEffect, useRef, useState } from "react";

import { CopyButton } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

/**
 * Props for the {@link CopyableText} component.
 *
 * Extends native `span` props (except `children`) and renders a truncated text
 * value with a compact copy-to-clipboard action.
 */
type CopyableTextProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  /** Visible text rendered inside the component. */
  value: string;
  /**
   * Optional value copied to the clipboard.
   * Falls back to `value` when omitted.
   */
  copyValue?: string;
  /** Class applied to the text element. */
  textClassName?: string;
  /** Class applied to the copy button. */
  copyButtonClassName?: string;
  /** Class applied to the copy/check icon. */
  iconClassName?: string;
  /**
   * Whether to show a tooltip on the copy button.
   *
   * Set this to `false` when the component is already rendered inside another
   * tooltip to avoid nested-tooltip conflicts.
   */
  showCopyTooltip?: boolean;
};

/**
 * Displays a single-line text value with an inline copy-to-clipboard button.
 *
 * The control is disabled when there is no non-empty value to copy.
 */
export const CopyableText = forwardRef<HTMLSpanElement, CopyableTextProps>(
  (
    {
      value,
      copyValue,
      className,
      textClassName,
      copyButtonClassName,
      iconClassName,
      showCopyTooltip = true,
      ...spanProps
    },
    ref,
  ) => {
    const [isCopied, setIsCopied] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const normalizedCopyValue = (copyValue ?? value).trim();
    const canCopy = Boolean(normalizedCopyValue);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const handleCopy = () => {
      if (!canCopy || isCopied) return;
      if (!navigator.clipboard?.writeText) return;

      navigator.clipboard
        .writeText(normalizedCopyValue)
        .then(() => {
          setIsCopied(true);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 1000);
        })
        .catch(() => {
          // Swallow clipboard errors to avoid breaking display-only views.
        });
    };

    return (
      <span
        ref={ref}
        className={cn("group inline-flex max-w-full items-center gap-1 align-middle", className)}
        {...spanProps}
      >
        <span className={cn("truncate", textClassName)} title={value}>
          {value}
        </span>

        <CopyButton
          isCopied={isCopied}
          showTooltip={showCopyTooltip}
          onClick={handleCopy}
          disabled={!canCopy}
          className={copyButtonClassName}
          iconClassName={iconClassName}
        />
      </span>
    );
  },
);

CopyableText.displayName = "CopyableText";
