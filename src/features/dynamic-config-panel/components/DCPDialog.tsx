import { buttonVariants } from "@aventisia/ui/buttons";
import { DialogContent, DialogWrapper } from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { DCPForm, useDynamicConfigPanelStore } from "..";
import DCPDialogHeader from "./DCPDialogHeader";
import { useLayoutEffect, useRef, useState } from "react";
import CallAgentConfigForm from "@/features/call-agent/components/CallAgentConfigForm";
import CallBlockConfigForm from "@/features/call-block/components/CallBlockConfigForm";

export const DCPDialog = ({ children }: React.PropsWithChildren) => {
  // Ref and state for dynamic <p> height
  const infoRef = useRef<HTMLParagraphElement>(null);
  const [infoHeight, setInfoHeight] = useState(0);

  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, nodeData, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      nodeData: state.nodeData,
      setShowDialog: state.setShowDialog,
    })),
  );

  useLayoutEffect(() => {
    if (infoRef.current) {
      setInfoHeight(infoRef.current.offsetHeight);
    }
  }, [showDialog, nodeData?.description, nodeData?.docsLink]);

  // Function to render correct form component based on nodeData.name
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

  // Renders the appropriate info link based on node type
  const renderInfoLink = () => {
    if (!nodeData) return null;

    let href = "#";
    let label = "Docs";

    switch (nodeData.type) {
      case "callAgentNode":
        if (nodeData?.selectedAgent) {
          href = `${import.meta.env.VITE_AGENT_BUILDER_URL}/agent?f=${nodeData.selectedAgent?.flowId}&v=${nodeData.selectedAgent?.id}`;
          label = "Open Agent";
        } else {
          return null; // Don't render anything if there's no agent
        }
        break;

      default:
        href = nodeData.docsLink || "#";
        label = "Docs";
    }

    return (
      <a
        className={cn(
          buttonVariants({ variant: "link" }),
          "ml-1 gap-1 text-xs",
        )}
        target="_blank"
        href={href}
      >
        {label}
        <SquareArrowOutUpRightIcon className="h-2.5 w-2.5 stroke-[2.5]" />
      </a>
    );
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
          "!max-w-[32rem]",
          nodeData?.name === "ConditionalBranchActivity" && "!max-w-[40rem]",
          nodeData?.name === "LoopActivity" && "!max-w-[40rem]",
        )}
      >
        <DCPDialogHeader className="border-none px-3.5 py-3 text-lg tracking-wide" />
        <p
          ref={infoRef}
          className="mx-2.5 rounded-lg bg-accent px-3 py-2 text-xs"
        >
          ℹ️ {nodeData?.description || "No description available."}
          {renderInfoLink()}
        </p>
        <ScrollArea
          style={{
            height: `calc(100vh - 3.8rem - ${infoHeight}px)`,
          }}
          className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4"
        >
          {renderFormComponent()}
        </ScrollArea>
      </DialogContent>
    </DialogWrapper>
  );
};
