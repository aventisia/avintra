import { cva } from "class-variance-authority";
import { LabelHTMLAttributes } from "react";

import { clsxMerge } from "../../utils";

const labelVariants = cva(
  "font-medium leading-none transition-colors duration-300 ease-in-out peer-disabled:opacity-70",
  {
    variants: {
      size: {
        large: "text-lg",
        medium: "text-sm",
        small: "text-xs",
      },
    },
  },
);

export interface LabelVariants {
  /** The size of the label. */
  size?: "small" | "medium" | "large";
}

export interface LabelProps
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">,
    Required<Pick<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">>,
    LabelVariants {}

export function Label({
  size = "medium",
  className,
  htmlFor,
  ...rest
}: LabelProps) {
  return (
    <label
      className={clsxMerge(labelVariants({ size }), className)}
      htmlFor={htmlFor}
      {...rest}
    />
  );
}

Label.displayName = "Label";
