import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useFlowOperations } from "@/features/react-flow/hooks/useFlowOperations";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@aventisia/ui/context-menu";
import { DeleteCMItem } from "@aventisia/ui/context-menu";
import { SimpleCMItem } from "@aventisia/ui/context-menu";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { Library } from "lucide-react";

export const ReactFlowContextMenu = ({ children }: React.PropsWithChildren) => {
  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  // Get selected nodes/edges
  const { setSelectedNode, setSelectedEdge, selectedNode, selectedEdge } =
    useContextMenuActionsStore();

  const { deleteNode } = useFlowOperations();

  return (
    <ContextMenu
      //To clear the node on close of context menu
      onOpenChange={(open) => {
        if (!open) {
          setSelectedNode(null);
          setSelectedEdge(null);
          autoLayout();
        }
      }}
    >
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        {/* Cut selection */}
        {/* <SimpleCMItem
          size="sm"
          content="Cut"
          Icon={Scissors}
          shortCut="Ctrl+X"
          disabled={!selectedNode}
          onClick={() => selectedNode && cutNode(selectedNode.id)}
        /> */}

        {/* Copy selection */}
        {/* <SimpleCMItem
          size="sm"
          content="Copy"
          Icon={Copy}
          shortCut="Ctrl+C"
          disabled={!selectedNode}
          onClick={() => selectedNode && copyNode(selectedNode.id)}
        /> */}

        {/* Paste cut or copied items */}
        {/* <SimpleCMItem
          size="sm"
          content="Paste"
          Icon={Clipboard}
          shortCut="Ctrl+V"
          disabled={!selectedEdge}
          onClick={() =>
            selectedEdge && pasteNode(selectedEdge.source, selectedEdge.target)
          }
        /> */}

        {/* <ContextMenuSeparator className="h-[0.5px]" /> */}

        {/* Organize items. Apply auto layout */}
        <SimpleCMItem
          size="sm"
          content="Organize"
          Icon={Library}
          onClick={() => autoLayout()}
        />

        <ContextMenuSeparator className="h-[0.5px]" />

        {/* Delete selected items */}
        <DeleteCMItem
          size="sm"
          disabled={!selectedNode && !selectedEdge}
          onClick={() => selectedNode && deleteNode(selectedNode.id)}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
};
