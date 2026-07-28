import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  InputHTMLAttributes,
} from "react";

type AutoSizeInputProps = InputHTMLAttributes<HTMLInputElement>

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
      <div className="relative inline-block">
        {/* Hidden span to measure text width */}
        <span
          ref={spanRef}
          className="invisible absolute whitespace-pre p-0 text-xs"
        />
        <input
          ref={ref}
          value={value}
          placeholder={placeholder}
          className={`rounded-none !border-0 !border-none bg-transparent !p-0 !text-xs !shadow-none !outline-none !ring-0 ${className}`}
          style={{ width }}
          {...props}
        />
      </div>
    );
  },
);

AutoSizeInput.displayName = "AutoSizeInput";

export default AutoSizeInput;
