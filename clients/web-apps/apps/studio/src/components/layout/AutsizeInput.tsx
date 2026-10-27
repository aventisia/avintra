import { InputHTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";

type AutoSizeInputProps = InputHTMLAttributes<HTMLInputElement>;

const AutoSizeInput = forwardRef<HTMLInputElement, AutoSizeInputProps>(
  ({ value = "", placeholder = "", className = "", ...props }, ref) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState(50);

    useEffect(() => {
      if (spanRef.current) {
        const text = value || placeholder || "";
        spanRef.current.textContent = text.toString();
        const spanWidth = spanRef.current.offsetWidth;
        setWidth(spanWidth + 2); // add slight buffer
      }
    }, [value, placeholder]);

    return (
      <div
        className={
          "relative w-auto max-w-full min-w-0 flex-none overflow-hidden rounded border border-transparent px-1.5 py-1 transition-colors " +
          "focus-within:border-line-strong focus-within:bg-surface"
        }
      >
        {/* Hidden span to measure text width */}
        <span ref={spanRef} className="invisible absolute whitespace-pre p-0 text-xs" />
        <input
          ref={ref}
          value={value}
          placeholder={placeholder}
          className={`block min-w-0 max-w-full truncate rounded-none !border-0 !border-none bg-transparent !p-0 !text-xs !shadow-none !outline-none !ring-0 ${className}`}
          style={{ width, maxWidth: "100%" }}
          {...props}
        />
      </div>
    );
  },
);

AutoSizeInput.displayName = "AutoSizeInput";

export default AutoSizeInput;
