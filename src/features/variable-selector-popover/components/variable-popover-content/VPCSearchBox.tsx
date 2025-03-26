import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

export const VPCSearchBox = () => {
  return (
    <div
      className="mx-3.5 mb-1.5 flex w-auto items-center rounded-lg bg-slate-100 px-3"
      cmdk-input-wrapper=""
    >
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className="flex h-9 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-80"
        placeholder="Search Variables..."
        autoFocus
      />
    </div>
  );
};
