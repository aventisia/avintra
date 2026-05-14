import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";
import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

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

  // Open viewer upon file upload
  useEffect(() => {
    if (
      files.length > 0 &&
      !showViewer &&
      nodeData?.name == "CreateInferencingAIAgent"
    ) {
      setShowViewer(true);
    }
  }, [files]);

  if (nodeData?.name !== "CreateInferencingAIAgent") return <></>;

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
        <p className="text-sm text-muted-foreground">
          {files?.length} file(s) uploaded
        </p>
      )}
    </div>
  );
}
