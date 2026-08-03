import { CommandInput } from "@avplatform/ui/command";

export const FVSearchBox = () => {
  return (
    <div className="mx-3 mb-1.5 rounded-lg bg-slate-100">
      <CommandInput className="h-9 text-xs" placeholder="Search versions..." autoFocus />
    </div>
  );
};
