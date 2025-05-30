import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { DialogTrigger } from "@aventisia/ui/dialog";
import {
  DCPDialog,
  useDynamicConfigPanelStore,
} from "@/features/dynamic-config-panel";
import { useShallow } from "zustand/react/shallow";
import { NodeDataType } from "@/types/node-data-type";

interface OpenNodeConfigProps {
  nodeId: string;
  nodeData: NodeDataType;
}

export const OpenNodeConfig2 = ({ nodeId, nodeData }: OpenNodeConfigProps) => {
  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, setShowDialog, setNodeId, setNodeData } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        showDialog: state.showDialog,
        setNodeId: state.setNodeId,
        setShowDialog: state.setShowDialog,
        setNodeData: state.setNodeData,
      })),
    );

  return (
    <DCPDialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon6" }),
          "group z-10",
          "aria-[expanded=true]:bg-accent",
          "nodrag nopan",
          "absolute right-3.5 top-2.5",
        )}
        onClick={() => {
          setShowDialog(!showDialog);
          setNodeId(nodeId);
          setNodeData(nodeData);
        }}
      >
        <Cog6ToothIcon
          className={cn(
            "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
          )}
        />
      </DialogTrigger>
    </DCPDialog>
  );
};
