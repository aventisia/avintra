import { cn } from "@/react-toolkit/lib/utils";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
}

const SearchBox = ({
  className,
  placeholder = "Search...",
}: SearchBoxProps) => {
  return (
    <a
      className={cn(
        "relative ml-4 hidden cursor-pointer items-center rounded-lg transition-all duration-300 hover:bg-white/20 xs:bg-white/10 md:absolute md:left-1/2 md:flex md:h-[2.1rem] md:w-[22rem] md:-translate-x-1/2",
        className,
      )}
    >
      <div className="absolute left-0 hidden items-center justify-center rounded-lg text-white/50 msm:flex md:w-10">
        <MagnifyingGlassIcon className="h-5 w-5" />
      </div>
      <span className="hidden pl-[2.4rem] text-white/50 md:flex">
        {placeholder}
      </span>
      <kbd className="pointer-events-none absolute right-1.5 hidden select-none items-center gap-1 rounded px-1.5 font-mono text-[0.8rem] font-medium uppercase text-white/50 transition-opacity contrast-more:border-current contrast-more:text-current contrast-more:dark:border-current sm:flex">
        <span>CTRL</span>
        <span>K</span>
      </kbd>
    </a>
  );
};

export { SearchBox };
