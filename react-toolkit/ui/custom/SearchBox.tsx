import { cn } from "@/react-toolkit/lib/utils";
import { Input } from "@/react-toolkit/ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBoxProps {
  kbdShortCutClassName?: string;
  className?: string;
  placeholder?: string;
}

const SearchBox = ({
  kbdShortCutClassName,
  className,
  placeholder = "Search...",
}: SearchBoxProps) => {
  return (
    <div
      className={cn(
        "relative hidden cursor-pointer items-center rounded-lg transition-all duration-500 xs:bg-slate-100 md:h-auto md:w-auto",
        className,
      )}
    >
      <div className="absolute hidden items-center justify-center rounded-lg msm:flex md:w-10">
        <MagnifyingGlassIcon className="h-5 w-5" />
      </div>
      <Input
        type="text"
        className="hidden h-8 rounded-lg border-none bg-slate-100 pl-[2.6rem] md:flex"
        placeholder={placeholder}
      />
      <kbd
        className={cn(
          "dark:bg-dark/50 pointer-events-none absolute hidden h-5 select-none items-center gap-1 rounded border bg-slate-200 px-1.5 font-mono text-[10px] font-medium text-gray-500 transition-opacity contrast-more:border-current contrast-more:text-current dark:border-gray-100/20 contrast-more:dark:border-current sm:flex",
          kbdShortCutClassName,
        )}
      >
        CTRL K
      </kbd>
    </div>
  );
};

export { SearchBox };
