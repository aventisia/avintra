import CallAgentConfigForm from "@/features/call-agent/CallAgentConfigForm";
import CallBlockConfigForm from "@/features/call-block/CallBlockConfigForm";
import FileViewer from "@/features/file-viewer/components/FileViewer";
import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";

import { DialogContent, DialogWrapper } from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { DCPForm, useDynamicConfigPanelStore } from "..";
import DCPDialogHeader from "./DCPDialogHeader";

export const DCPDialog = ({ children }: React.PropsWithChildren) => {
  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, showViewer, nodeData, setShowDialog } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        showDialog: state.showDialog,
        showViewer: state.showViewer,
        nodeData: state.nodeData,
        setShowDialog: state.setShowDialog,
      })),
    );

  const { clearAllFiles } = useLocalFileStore(
    useShallow((s) => ({ clearAllFiles: s.clearAllFiles })),
  );

  // Function to render correct form component based on nodeData.type
  const renderFormComponent = () => {
    switch (nodeData?.type) {
      case "callAgentNode":
        return <CallAgentConfigForm />;
      case "blockNode":
        return <CallBlockConfigForm />;
      default:
        return <DCPForm />;
    }
  };

  return (
    <DialogWrapper
      open={showDialog}
      onOpenChangeFn={() => {
        clearAllFiles();
        // Dialog is closing
        setShowDialog(!showDialog);
      }}
    >
      {children}
      <DialogContent
        side={"right"}
        className={cn(
          "right-2 mt-[calc(var(--header-height)+2*var(--header-padding))] h-[calc(100vh-var(--header-height)-3*var(--header-padding))] !max-w-[32rem] rounded-e-xl",
          nodeData?.name === "ConditionalBranchActivity" && "!max-w-[40rem]",
          nodeData?.name === "LoopActivity" && "!max-w-[40rem]",
          (nodeData?.name.includes("AIAgent") ||
            nodeData?.name.includes("WorkItem")) &&
            "!max-w-[calc((100vw-(2*var(--header-padding)))/2)]",

          showViewer &&
            "!max-w-[100vw] w-[calc(100vw-2*var(--header-padding))]",
        )}
      >
        <div className={cn(showViewer && "grid grid-cols-2")}>
          <div className={cn(showViewer ? "border-r" : "hidden")}>
            <FileViewer />
          </div>
          <div className={cn(showViewer && " ")}>
            <DCPDialogHeader />
            {renderFormComponent()}
          </div>
        </div>
      </DialogContent>
    </DialogWrapper>
  );
};
