import { CommandInput } from "@avplatform/ui/command";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export const FPCSearchBox = () => {
  return (
    <div
      className="mx-3.5 mb-1.5 flex w-auto items-center rounded-md border border-line bg-sunken px-3"
      cmdk-input-wrapper=""
    >
      <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandInput
        className="flex h-9 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-80"
        placeholder="Search flows..."
        autoFocus
      />
    </div>
  );
};
