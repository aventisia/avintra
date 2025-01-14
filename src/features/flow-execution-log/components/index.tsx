import { useShallow } from "zustand/react/shallow";
import { useFlowExecutionLogStore } from "../stores/flow-execution-lof-store";
import FELInputOutput from "./FELInputOutput/FELInputOutput";
import FLEActionList from "./FELActionsSection/FELActionsSection";
import { useFetchFlowExecutionLogs } from "../hooks/useFetchFlowExecutionLogs";
import { useEffect } from "react";
import FELSkeleton from "./FELSkeleton";

const FlowExecutionLog = () => {
  // Get flow execution store state & actions
  const { selectedActionId, setSelectedActionId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      flowExecutionLogId: state.flowExecutionLogId,
      setFlowExecutionLogId: state.setFlowExecutionLogId,
      selectedActionId: state.selectedActionId,
      setSelectedActionId: state.setSelectedActionId,
    })),
  );
  //Fetch flow log execution data
  const { data, isLoading } = useFetchFlowExecutionLogs();

  //Set initial action id to view input/output
  useEffect(() => {
    if (data && data?.data?.length > 0)
      setSelectedActionId(data?.data[0].id || "");
  }, [data, setSelectedActionId]);

  //Get selected action object to view input/output
  const selectedAction = data?.data.find((item) => item.id == selectedActionId);

  return (
    <div className="m-5 flex-1 space-y-4">
      {!isLoading ? (
        data && (
          <div className="flex">
            <div className="w-1/2 pr-2">
              <FLEActionList actionList={data?.data} />
            </div>
            <div className="flex h-full w-1/2 flex-col gap-3 border-l pl-2">
              <FELInputOutput
                title="Input"
                jsonData={selectedAction?.inputData || "{}"}
              />
              <FELInputOutput
                title="Output"
                jsonData={selectedAction?.outputData || "{}"}
              />
            </div>
          </div>
        )
      ) : (
        <FELSkeleton />
      )}
    </div>
  );
};

export default FlowExecutionLog;
