import { cn } from "@avplatform/ui/lib";

export interface SegOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Color variant for the selected state. */
  variant?: "generic" | "risk";
}

/**
 * Segmented button group used for single-choice fields (materiality,
 * complexity, autonomy, third-party/AI flags, etc.).
 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  variant = "generic",
}: SegmentedControlProps<T>) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md border px-4 py-2 text-xs font-semibold transition-colors",
              variant === "risk" && selected && "border-primary bg-primary/15 text-primary",
              variant === "risk" && !selected && "border-border text-muted-foreground",
              variant === "generic" && selected && "border-primary bg-primary/20 text-primary",
              variant === "generic" && !selected && "border-border text-muted-foreground",
              "hover:border-primary/60",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
