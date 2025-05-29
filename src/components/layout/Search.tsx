import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { Tooltip } from "@aventisia/ui/tooltip";
import { Button } from "@aventisia/ui/buttons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchCommandDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Tooltip content="Search">
        <Button
          size="icon8"
          variant="ghost"
          className="hover:bg-white/10"
          onClick={() => setOpen(true)}
        >
          <MagnifyingGlassIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
        </Button>
      </Tooltip>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem></CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default SearchCommandDialog;
