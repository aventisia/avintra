import { CommandInput } from "@avplatform/ui/command";

export const FVSearchBox = () => {
  return (
    <div className="mx-3 mb-1.5 rounded-md border border-line bg-sunken">
      <CommandInput className="h-9 text-xs" placeholder="Search versions..." autoFocus />
    </div>
  );
};
