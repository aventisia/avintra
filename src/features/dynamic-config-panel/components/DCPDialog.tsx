import { buttonVariants } from "@aventisia/ui/buttons";
import {
  DialogContent,
  DialogDefaultHeader,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { DCPForm, useDynamicConfigPanelStore } from "..";

export const DCPDialog = ({ children }: React.PropsWithChildren) => {
  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, nodeData, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      nodeData: state.nodeData,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Return dynamic config panel dialog
  return (
    <DialogWrapper
      open={showDialog}
      onOpenChangeFn={() => setShowDialog(!showDialog)}
    >
      {children}
      <DialogContent
        side={"right"}
        className={cn(
          "!max-w-[32rem]",
          nodeData?.name === "ConditionalBranchActivity" && "!max-w-[40rem]",
        )}
      >
        <DialogDefaultHeader
          className="border-none px-3.5 py-3 text-lg tracking-wide"
          heading={nodeData?.label || "Dynamic Config Panel"}
          // TODO: Add node/acitivity description with docs link
        />
        <p className="mx-2.5 rounded-lg bg-accent px-3 py-2 text-xs">
          ℹ️ {nodeData?.description || "No description available."}
          <a
            className={cn(
              buttonVariants({ variant: "link" }),
              "ml-1 gap-1 text-xs",
            )}
            target="_blank"
            href={nodeData?.docsLink || "#"}
          >
            Docs{" "}
            <SquareArrowOutUpRightIcon className="h-2.5 w-2.5 stroke-[2.5]" />
          </a>
        </p>
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <DCPForm />
        </ScrollArea>
      </DialogContent>
    </DialogWrapper>
  );
};
