import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@avplatform/ui/dialog";
import { ArrowBendDownLeftIcon, MagnifyingGlassMinusIcon } from "@phosphor-icons/react";
import { useReactFlow } from "@xyflow/react";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useSearchStore } from "@/features/search/stores/serach-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex min-w-5 items-center justify-center rounded-[4px] border border-b-2 border-line-strong bg-surface px-[5px] py-[3px] font-mono text-[11px] leading-none text-muted-foreground">
    {children}
  </kbd>
);

const GROUP_CLASS_NAME =
  "p-0 [&:not([hidden])~&]:mt-2 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-1 [&_[cmdk-group-heading]]:font-mono";

export const SearchCommandDialog = () => {
  const open = useSearchStore((state) => state.showDialog);
  const setOpen = useSearchStore((state) => state.setShowDialog);

  const { setCenter, getNode, updateNode } = useReactFlow();

  const nodes = useReactFlowExtStore((state) => state.nodes);
  const nodeSearchList = useMemo(
    () =>
      nodes
        .filter(
          (n) =>
            ((n.data?.label as string) || (n.data?.name as string)) && n.type !== "triggerNode",
        )
        .map((n) => ({
          id: n.id,
          label: (n.data?.label as string) || (n.data?.name as string),
        })),
    [nodes],
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

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (!node) return;

      updateNode(nodeId, { selected: true });

      if (node.measured?.width && node.measured.height) {
        setCenter(
          node.position.x + node.measured.width / 2,
          node.position.y + node.measured.height / 2,
          {
            zoom: 1,
            duration: 500,
          },
        );
      }

      setOpen(false);
    },
    [getNode, updateNode, setCenter, setOpen],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[12vh] max-w-[640px] translate-y-0 overflow-hidden rounded-xl border border-line p-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
        <DialogTitle className="sr-only">Search canvas nodes</DialogTitle>
        <Command loop className="rounded-none">
          <div className="flex items-center border-b border-line pr-4 [&>[cmdk-input-wrapper]]:flex-1 [&>[cmdk-input-wrapper]]:px-4">
            <CommandInput
              placeholder={
                nodeSearchList.length > 0
                  ? `Search ${nodeSearchList.length} nodes…`
                  : "Search nodes…"
              }
              className="h-14 text-body"
              autoFocus
            />
            <Kbd>Esc</Kbd>
          </div>
          <CommandList className="max-h-[min(440px,60vh)] scroll-py-2 p-2">
            <CommandEmpty className="flex flex-col items-center gap-2 py-10 text-body-sm text-muted-foreground">
              <MagnifyingGlassMinusIcon className="size-6" aria-hidden="true" />
              No nodes match your search.
            </CommandEmpty>
            <CommandGroup heading={`Nodes · ${nodeSearchList.length}`} className={GROUP_CLASS_NAME}>
              {nodeSearchList.map((node, i) => (
                <CommandItem
                  key={node.id}
                  value={`${node.label} ${i + 1}`}
                  onSelect={() => handleSelectNode(node.id)}
                  className="group/item min-h-10 cursor-pointer gap-3 rounded-md px-2.5 aria-selected:bg-fill"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md border border-line bg-surface font-mono text-[11px] font-medium text-muted-foreground transition-colors group-aria-selected/item:border-primary/40 group-aria-selected/item:text-primary-text">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{node.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground group-aria-selected/item:hidden">
                    Step {i + 1}
                  </span>
                  <ArrowBendDownLeftIcon
                    className="hidden size-4 shrink-0 text-muted-foreground group-aria-selected/item:block"
                    aria-hidden="true"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center gap-4 border-t border-line bg-sunken px-4 py-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              Jump to node
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5">
              <Kbd>Esc</Kbd>
              Close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
SearchCommandDialog.displayName = "SearchCommandDialog";
