import { cn } from "@avplatform/ui/lib";
import { FormFieldSizeType } from "@avplatform/ui/types";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface ConfigPanelAutosizeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldSize?: FormFieldSizeType;
}

const ConfigPanelAutosizeInput = React.forwardRef<
  HTMLInputElement,
  ConfigPanelAutosizeInputProps
>(
  (
    { className, type, value, placeholder, fieldSize = "base", ...props },
    ref,
  ) => {
    // State to manage the width of the input
    const [inputWidth, setInputWidth] = useState(100);
    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (spanRef.current) {
        const width = spanRef.current.offsetWidth;
        // have check of maxwidth to prevent the input from being too wide
        setInputWidth(width > 250 ? 250 : width);
      }
    }, [value]);

    return (
      <div className="relative inline-flex">
        {/* Hidden mirror span */}
        <span
          ref={spanRef}
          className={cn(
            "invisible absolute left-0 top-0 h-10 whitespace-pre border font-normal",
            fieldSize === "xs" && "h-7 px-[0.45rem] text-2xs",
            fieldSize === "sm" && "h-8 px-[0.55rem] text-xs",
            fieldSize === "base" && "h-10 px-3 text-sm",
            className,
          )}
        >
          {value || placeholder || ""}
        </span>

        {/* Input field */}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-full border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:tracking-normal placeholder:text-muted-foreground read-only:cursor-not-allowed read-only:opacity-80 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80",
            fieldSize === "xs" && "h-7 px-[0.45rem] text-2xs",
            fieldSize === "sm" && "h-8 px-[0.55rem] text-xs",
            fieldSize === "base" && "h-10 px-3 text-sm",
            className,
          )}
          value={value}
          style={{ width: inputWidth }}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
ConfigPanelAutosizeInput.displayName = "ConfigPanelAutosizeInput";

export { ConfigPanelAutosizeInput, type ConfigPanelAutosizeInputProps };

