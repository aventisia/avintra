import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";
import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";

export default function ViewerButton() {
  // Get state and actions from the DynamicConfigPanel store
  const { showViewer, nodeData, setShowViewer } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showViewer: state.showViewer,
      nodeData: state.nodeData,
      setShowViewer: state.setShowViewer,
    })),
  );
  const { files } = useLocalFileStore(
    useShallow((s) => ({ files: s.files, activeFileId: s.activeFileId })),
  );

  // Close viewer when moving away form test screen
  useEffect(() => {
    return () => {
      setShowViewer(false);
    };
  }, []);

  const isAllowedModel = ["CreateInferencingAIAgent", "CreateConversationAIAgent"].includes(
    nodeData?.name ?? "",
  );

  // Open viewer upon file upload
  useEffect(() => {
    if (files.length > 0 && !showViewer && isAllowedModel) {
      setShowViewer(true);
    }
  }, [files]);

  if (!isAllowedModel) return <></>;

  return (
    <div className="flex gap-2 items-center">
      <Button
        type="button"
        size={"sm"}
        onClick={() => {
          setShowViewer(!showViewer);
        }}
      >
        <ArrowLeftIcon
          className={cn(
            "mr-2 h-4 w-4 text-primary-foreground transition-transform",
            showViewer && "rotate-180",
          )}
        />
        Viewer
      </Button>
      {files.length > 0 && (
        <p className="text-sm text-muted-foreground">{files?.length} file(s) uploaded</p>
      )}
    </div>
  );
}
