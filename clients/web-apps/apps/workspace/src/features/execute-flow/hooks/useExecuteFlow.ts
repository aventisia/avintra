import { toast } from "@avplatform/ui/sonner";
import { useShallow } from "zustand/react/shallow";

import { getAvailableCredits } from "@/features/available-credits/available-credits-apis.ee";

import { startJob } from "../apis/job-trigger-apis";
import { JobDetailsDto } from "../dtos/job-details-dto";
import { useCurrentFlowStore } from "../stores/current-flow-store";
import { useJobDataStore } from "../stores/job-data-store";

export default function useExecuteFlow() {
  const { executionState, setExecutionState, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
      setExecutionState: state.setExecutionState,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );
  const { updateField } = useJobDataStore(
    useShallow((state) => ({
      updateField: state.updateField,
    })),
  );

  const isCommercial = false;

  const startExecution = async (data: JobDetailsDto) => {
    if (executionState === "executing" || executionState === "launching-executor") {
      return;
    }

    if (isCommercial) {
      const creditsData = await getAvailableCredits();
      if (creditsData?.data && creditsData.data.availableCredits < 10) {
        toast.error("Insufficient credits. Please top up to continue.");
        return;
      }
    }

    if (!data) return;

    setCurrentFlow({
      id: data?.flowId || "",
      versionId: data?.flowVersionId,
      inputOutputObject: data?.inputOutputObject || "",
      name: data?.name || "",
      jobId: data.id,
      machineId: data.machineId,
    });

    setExecutionState("launching-executor");

    try {
      const startTime = new Date();
      updateField("startTime", startTime);

      await startJob({ id: data.id });

      setExecutionState("executing");
    } catch (error) {
      toast.error(`Failed to start execution: ${error}`);
      setExecutionState("stopped");
    }
  };

  return { startExecution, setExecutionState };
}
