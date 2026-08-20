import { cn } from "@avplatform/ui/lib";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
}

const SearchBox = ({ className, placeholder = "Search..." }: SearchBoxProps) => {
  return (
    <a
      className={cn(
        "relative ml-4 hidden cursor-pointer items-center rounded-lg transition-all duration-300 hover:bg-white/20 xs:bg-white/10 md:absolute md:left-1/2 md:flex md:h-[2.1rem] md:w-[22rem] md:-translate-x-1/2",
        className,
      )}
    >
      <div className="absolute left-0 hidden items-center justify-center rounded-lg text-white/50 msm:flex md:w-10">
        <MagnifyingGlassIcon className="h-[1.1rem] w-[1.1rem] stroke-[2]" />
      </div>
      <span className="-mb-0.5 hidden pl-[2.4rem] text-[0.85rem] text-white/50 md:flex">
        {placeholder}
      </span>
    </a>
  );
};

export { SearchBox };
