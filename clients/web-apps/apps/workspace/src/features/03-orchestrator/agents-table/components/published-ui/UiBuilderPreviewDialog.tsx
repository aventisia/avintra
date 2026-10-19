import { LoadingSpinner } from "@avplatform/ui";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { UiBuilderHostFrame } from "@avplatform/ui/ui-builder-host";
import { useShallow } from "zustand/react/shallow";

import { usePublishedUiView } from "../../hooks/usePublishedUiView.hook";
import { usePublishedUiStore } from "../../stores/published-ui-store";

const UiBuilderPreviewDialog = () => {
  const { open, close, uiBuilderProjectId } = usePublishedUiStore(
    useShallow((state) => ({
      open: state.viewDialogOpen,
      close: state.closeViewDialog,
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  const { data, isFetching } = usePublishedUiView(uiBuilderProjectId, open);

  const project = data?.data?.project;
  const html = data?.data?.headVersion?.generatedHtml ?? "";

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue: boolean) => {
        if (!openValue) close();
      }}
    >
      <DialogContent className="h-[80vh] max-w-5xl p-0">
        <DialogDefaultHeader
          heading={project?.name ?? "Interface"}
          description={project?.description ?? ""}
        />
        {isFetching ? (
          <div className="flex h-[calc(80vh-3.5rem)] items-center justify-center">
            <LoadingSpinner className="h-6 w-6 text-primary" />
          </div>
        ) : html ? (
          <UiBuilderHostFrame
            html={html}
            title={project?.name ?? "Interface"}
            className="h-[calc(80vh-3.5rem)] w-full border-0 bg-white"
          />
        ) : (
          <div className="flex h-[calc(80vh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
            This interface is not available. It may have been disabled.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UiBuilderPreviewDialog;
