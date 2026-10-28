import { cn } from "@avplatform/ui/lib";

interface Props {
  errorsOnly: boolean;
  onChange: (errorsOnly: boolean) => void;
}

const OPTIONS = [
  { label: "All", value: false },
  { label: "Errors", value: true },
];

export const ExecutionLogFilter = ({ errorsOnly, onChange }: Props) => {
  return (
    <div className="inline-flex gap-0.5 rounded-md border border-line bg-sunken p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={errorsOnly === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex h-[22px] items-center rounded-sm px-2.5 text-[12.5px]/[18px] font-semibold text-muted-foreground hover:text-ink focus-visible:shadow-focus focus-visible:outline-none",
            errorsOnly === option.value && "bg-fill text-ink shadow-[0_0_0_1px_var(--line-strong)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
