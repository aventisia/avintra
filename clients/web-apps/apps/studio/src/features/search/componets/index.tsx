import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useReactFlow } from "@xyflow/react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCallback, useMemo } from "react";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useSearchStore } from "@/features/search/stores/serach-store";

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
            ((n.data?.label as string) || (n.data?.name as string)) &&
            n.type !== "triggerNode",
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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search..." autoFocus />
      <ScrollArea className="h-[50vh]">
        <CommandList>
          <CommandGroup heading="Nodes">
            {nodeSearchList.map((node, i) => (
              <CommandItem
                key={node.id}
                onSelect={() => handleSelectNode(node.id)}
                className="cursor-pointer rounded-lg px-2 text-2xs"
              >
                {`${i + 1}. ${node.label}`}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </ScrollArea>
    </CommandDialog>
  );
};
SearchCommandDialog.displayName = "SearchCommandDialog";
