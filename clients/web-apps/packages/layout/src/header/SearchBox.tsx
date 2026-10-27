import { cn } from "@avplatform/ui/lib";
import { SearchIcon } from "lucide-react";

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
}

const SearchBox = ({ className, placeholder = "Search..." }: SearchBoxProps) => {
  return (
    <button
      type="button"
      className={cn(
        "hidden h-control-md w-[260px] cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-sunken pl-2.5 pr-1.5 text-body-sm text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none motion-reduce:transition-none md:inline-flex",
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="truncate">{placeholder}</span>
      <kbd className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-sm border border-line bg-fill px-1 font-mono text-2xs font-medium leading-none text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
};

export { SearchBox };
