import { DialogContent, DialogWrapper } from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import { useShallow } from "zustand/react/shallow";
import { DCPForm, useDynamicConfigPanelStore } from "..";
import DCPDialogHeader from "./DCPDialogHeader";
import CallAgentConfigForm from "@/features/call-agent/components/CallAgentConfigForm";
import CallBlockConfigForm from "@/features/call-block/components/CallBlockConfigForm";
import ModelConfigForm from "@/features/call-model/components/ModelConfigForm";
import { LLMConfigForm } from "@/features/create-model/components/llm-config/LLMConfigForm";

export const DCPDialog = ({ children }: React.PropsWithChildren) => {
  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, nodeData, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      nodeData: state.nodeData,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Function to render correct form component based on nodeData.type
  const renderFormComponent = () => {
    switch (nodeData?.type) {
      case "callAgentNode":
        return <CallAgentConfigForm />;
      case "blockNode":
        return <CallBlockConfigForm />;
      case "aiNode":
        return <ModelConfigForm />;
      default:
        return <DCPForm />;
    }
  };

  // Function to render create AI agent form component based on nodeData.name
  const renderCreateAIAgentForm = () => {
    switch (nodeData?.name) {
      case "Text/CreateAIAgent":
        return <LLMConfigForm />;
      case "Vision/CreateAIAgent":
        return <LLMConfigForm />;
      default:
        return <DCPForm />;
    }
  };

  return (
    <DialogWrapper
      open={showDialog}
      onOpenChangeFn={() => setShowDialog(!showDialog)}
    >
      {children}
      <DialogContent
        side={"right"}
        className={cn(
          "right-2 mt-[calc(var(--header-height)+2*var(--header-padding))] h-[calc(100vh-var(--header-height)-3*var(--header-padding))] !max-w-[32rem] rounded-e-xl",
          nodeData?.name === "ConditionalBranchActivity" && "!max-w-[40rem]",
          nodeData?.name === "LoopActivity" && "!max-w-[40rem]",
          nodeData?.name.includes("CreateAIAgent") &&
            "!max-w-[calc((100vw-(2*var(--header-padding)))/2)]",
        )}
      >
        <DCPDialogHeader />

        {nodeData?.name.includes("CreateAIAgent")
          ? renderCreateAIAgentForm()
          : renderFormComponent()}
      </DialogContent>
    </DialogWrapper>
  );
};
