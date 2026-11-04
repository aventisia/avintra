import { toast } from "@avplatform/ui/sonner";
import {
  buildFlowExportFileName,
  downloadJsonFile,
  getMutationErrorMessage,
} from "@avplatform/ui/utils";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { getFlowToLoad } from "@/features/01-build/flow-builder";

import { buildFlowExportPayload } from "../utils/flow-export.util";

const exportFlowMutationKey = (flowId: string) => ["export-flow", flowId];

// IMPORTANT NOTE: the axios interceptor already toasts HTTP errors other than 400, 409 and 429, which it rejects with a plain message.
const isErrorUnannounced = (error: unknown) =>
  typeof error === "string" || !isAxiosError(error) || !error.response;

/**
 * Downloads the version of an agent that Open would show, as the Studio's Export JSON.
 */
export const useExportFlow = (flowId: string) => {
  const isExporting =
    useIsMutating({ mutationKey: exportFlowMutationKey(flowId), exact: true }) > 0;

  const { mutate } = useMutation({
    mutationKey: exportFlowMutationKey(flowId),
    mutationFn: () => getFlowToLoad(flowId),
    onSuccess: ({ data: loadFlow }) => {
      downloadJsonFile(
        buildFlowExportPayload(loadFlow),
        buildFlowExportFileName(loadFlow.name, loadFlow.versionNumber),
      );
      toast.success("Exported Successfully");
    },
    onError: (error) => {
      if (isErrorUnannounced(error)) toast.error(getMutationErrorMessage(error));
    },
  });

  return { exportFlow: () => mutate(), isExporting };
};
