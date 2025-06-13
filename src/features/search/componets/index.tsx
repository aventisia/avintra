import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useReactFlow } from "@xyflow/react";
import { useSearchStore } from "@/features/search/stores/serach-store";

const SearchCommandDialog = () => {
  const { open, setOpen } = useSearchStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
    })),
  );
  const { setCenter } = useReactFlow();

  // Get nodes from the store
  const { nodes, setNodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );

  const handleSelectNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Select the node
    setNodes(
      nodes.map((n) => ({
        ...n,
        selected: n.id === node.id,
      })),
    );

    // Center and zoom to the node
    if (node.measured?.width && node.measured.height)
      setCenter(
        node.position.x + node.measured?.width / 2,
        node.position.y + node.measured?.height / 2,
        {
          zoom: 1,
          duration: 500,
        },
      );

    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search..." />
      <ScrollArea className="h-[50vh]">
        <CommandList>
          <CommandGroup heading="Nodes">
            {nodes
              .filter(
                (n) =>
                  ((n.data?.label as string) || (n.data?.name as string)) &&
                  n.type != "triggerNode",
              )
              .map((node, i) => (
                <CommandItem
                  key={node.id}
                  onSelect={() => handleSelectNode(node.id)}
                  className="cursor-pointer rounded-lg px-2 text-2xs"
                >
                  {`${i + 1}. ${(node.data?.label as string) || (node.data?.name as string)}`}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </ScrollArea>
    </CommandDialog>
  );
};

export default SearchCommandDialog;
