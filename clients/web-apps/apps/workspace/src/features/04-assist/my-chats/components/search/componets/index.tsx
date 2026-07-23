import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  // CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { useSearchStore } from "../stores/serach-store";

export const SearchCommandDialog = () => {
  const { open, setOpen } = useSearchStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
    })),
  );

  // Stable hotkey handler
  useHotkeys(
    "ctrl+k",
    (e) => {
      e.preventDefault();
      setOpen(true);
    },
    { enableOnFormTags: true },
    [setOpen],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search..." autoFocus />
      <ScrollArea className="h-[50vh]">
        <CommandList>
          <CommandGroup className="font-medium" heading="Chats"></CommandGroup>
        </CommandList>
      </ScrollArea>
    </CommandDialog>
  );
};
SearchCommandDialog.displayName = "SearchCommandDialog";
