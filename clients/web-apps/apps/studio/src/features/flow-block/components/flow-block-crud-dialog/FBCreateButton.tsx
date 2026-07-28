import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";
import { SimpleCMItem } from "@avplatform/ui/context-menu";
import { CombineIcon, PencilIcon } from "lucide-react";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useFlowBlockStore } from "../../stores/flow-block-store";
import { getGroupContents } from "../../utils/getGroupedNodes";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Renders a create button that triggers a dialog for creating a new flow block.
 */
export const FBCreateButton: React.FC = () => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  const { selectedNode } = useContextMenuActionsStore(
    useShallow((state) => ({ selectedNode: state.selectedNode })),
  );

  const { setFlowBlockObject, setGroupId } = useFlowBlockStore(
    useShallow((state) => ({
      setFlowBlockObject: state.setFlowBlockObject,
      setGroupId: state.setGroupId,
    })),
  );

  const { edges, nodes } = useReactFlowExtStore(
    useShallow((state) => ({ edges: state.edges, nodes: state.nodes })),
  );

  const isBlockCreated = !!selectedNode?.data?.isBlock;

  // Return the component
  return (
    <>
      {isBlockCreated ? (
        <SimpleCMItem
          size="sm"
          content="Update Block"
          Icon={PencilIcon}
          onClick={() => {
            setGroupId(selectedNode?.id || "");
            setFlowBlockObject(
              getGroupContents({
                edges,
                nodes,
                groupNodeId: selectedNode?.id || "",
              }),
            );
            setCrudDialogOptions({
              showDialog: true,
              rowId: selectedNode?.data?.blockId as string,
              crudAction: "update",
            });
          }}
        />
      ) : (
        <SimpleCMItem
          size="sm"
          content="Convert to a Block"
          Icon={CombineIcon}
          onClick={() => {
            setGroupId(selectedNode?.id || "");
            setFlowBlockObject(
              getGroupContents({
                edges,
                nodes,
                groupNodeId: selectedNode?.id || "",
              }),
            );
            setCrudDialogOptions({
              showDialog: true,
              rowId: window.crypto.randomUUID(),
              crudAction: "create",
            });
          }}
        />
      )}
    </>
  );
};
