import { X as RemoveIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, forwardRef, useState } from "react";

import { Input, type InputProps } from "@/ui/components";
import { Badge } from "@/ui/components/badge";
import { cn } from "@/ui/lib";

type TagInputProps = InputProps & {
  value: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
};

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ value, disabled, className, placeholder, onChange, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = useState("");

    const addPendingDataPoint = () => {
      if (pendingDataPoint) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint("");
      }
    };

    return (
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background p-1 py-1.5 pl-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled ? "cursor-not-allowed opacity-80" : "cursor-auto opacity-100",
        )}
      >
        {value.map((item, index) => (
          <Badge
            key={index}
            className={cn(
              "flex h-6 cursor-default items-center gap-1 py-0 pl-3 pr-2",
              disabled ? "cursor-not-allowed" : "cursor-auto",
            )}
            variant={"secondary"}
          >
            <span className="text-2xs">{item}</span>
            <button
              aria-label={`Remove ${item} option`}
              aria-roledescription="button to remove option"
              type="button"
              onClick={() => {
                onChange(value.filter((i) => i !== item));
              }}
              disabled={disabled}
              className={cn(disabled ? "cursor-not-allowed" : "cursor-auto")}
            >
              <span className="sr-only">Remove {item} option</span>
              <RemoveIcon
                className={cn(
                  "h-4 w-4",
                  disabled ? "cursor-not-allowed" : "cursor-auto hover:stroke-destructive",
                )}
              />
            </button>
          </Badge>
        ))}
        <Input
          value={pendingDataPoint}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPendingDataPoint();
            } else if (e.key === "," || e.key === " ") {
              e.preventDefault();
              addPendingDataPoint();
            } else if ((e.key === "Backspace" || e.key === "Delete") && value.length > 0) {
              if (pendingDataPoint.length === 0) {
                e.preventDefault();
                onChange(value.filter((item) => item !== value[value.length - 1]));
              }
            }
          }}
          className={cn(
            "ml-1.5 h-6 min-w-[4rem] flex-1 border-none p-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            className,
          )}
          {...props}
          ref={ref}
        />
      </div>
    );
  },
);

export { TagInput, type TagInputProps };
