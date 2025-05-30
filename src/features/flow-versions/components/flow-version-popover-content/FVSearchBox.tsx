import { CommandInput } from "@aventisia/ui/command";

export const FVSearchBox = () => {
  return (
    <div
      className="mx-1.5 mb-1.5 flex w-auto items-center rounded-lg bg-slate-100 px-3"
      cmdk-input-wrapper=""
    >
      <CommandInput
        className="flex h-9 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-80"
        placeholder="Search version..."
        autoFocus
      />
    </div>
  );
};
