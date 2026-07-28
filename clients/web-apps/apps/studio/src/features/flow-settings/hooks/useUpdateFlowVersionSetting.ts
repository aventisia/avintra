import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { updateFlowVersionSetting } from "../apis/flow-settings-api";
import { ExecutionSettings } from "../types/setting-types";

export const useUpdateFlowVersionSetting = () => {
  // Create a mutation to update flow
  const { mutateAsync: updateFlowSettings, isPending } = useMutation({
    mutationFn: ({
      payload,
      versionId,
    }: {
      versionId: string;
      payload: ExecutionSettings;
    }) => updateFlowVersionSetting({ versionId, payload }),
    onSuccess: () => {
      toast.success("Settings updated successfully.", {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { updateFlowSettings, isPending };
};
