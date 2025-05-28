import { useState } from "react";
import { SearchIcon } from "lucide-react";
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

const SearchCommandDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Tooltip content="Search">
        <Button
          variant="ghost"
          size={"icon8"}
          className="hover:bg-white/10"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="h-4 w-4 text-primary-foreground" />
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
