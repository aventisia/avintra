import { LoadingSpinner } from "@avplatform/ui";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { UiBuilderHostFrame, fetchUiBuilderAssetMap } from "@avplatform/ui/ui-builder-host";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

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
  const assetsQuery = useQuery({
    queryKey: ["ui-builder-view-assets", uiBuilderProjectId],
    queryFn: () =>
      fetchUiBuilderAssetMap({
        http: axiosInstance,
        apiBaseUrl: import.meta.env.VITE_WORKSPACE_API_PATH,
        projectId: uiBuilderProjectId ?? "",
        getHeaders: getSpaceHeaders,
      }),
    enabled: open && Boolean(uiBuilderProjectId),
    staleTime: 5 * 60_000,
  });

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
            assets={assetsQuery.data}
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
