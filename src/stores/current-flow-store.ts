import { IProjectInfoDTO } from "@/features/react-flow/dtos/load-flow-dto";
import { ExecutionStateType } from "@/features/execute-flow/types/execution-state-type";
import { create } from "zustand";

interface ICurrentFlowDetails {
  id: string;
  name: string;
  // TODO: version
}

interface ExecutionGroup {
  id: string;
  conditionalMode: "SwitchCase" | "NestedIfElse";
  branches: string[];
  mergeBranchesNodeId: string;
}

type State = {
  /** Details of the currently opened flow */
  currentFlow: ICurrentFlowDetails;

  /** Flag to indicate if flow is loading */
  isFlowLoading: boolean;

  /** Flag to indicate if flow is saving in the background */
  isFlowSaving: boolean;

  /** Indicates flow execution state */
  executionState: ExecutionStateType;

  executionGroup: ExecutionGroup | null;

  projectInfo: IProjectInfoDTO;
};

type Actions = {
  /** Sets currently opened flow details */
  setCurrentFlow: (flowDetails: ICurrentFlowDetails) => void;

  /** Sets the loading state of the flow */
  setIsFlowLoading: (isLoading: boolean) => void;

  /** Sets the saving state of the flow */
  setIsFlowSaving: (isSaving: boolean) => void;

  /** Sets the executing state of the flow */
  setExecutionState: (executionState: ExecutionStateType) => void;

  /** Sets the execution group */
  setExecutionGroup: (executionGroup: ExecutionGroup | null) => void;

  /** Set Project info of the flow */
  setProjectInfo: (projectInfo: IProjectInfoDTO) => void;
};

export const useCurrentFlowStore = create<State & Actions>((set) => ({
  currentFlow: { id: "", name: "" },
  isFlowLoading: false,
  isFlowSaving: false,
  executionState: "stopped",
  executionGroup: null,
  projectInfo: {
    versionId: "",
    versionNumber: null,
    name: "",
    type: "",
  },

  setCurrentFlow: (flowDetails) => set({ currentFlow: flowDetails }),

  setIsFlowLoading: (isLoading) => set({ isFlowLoading: isLoading }),

  setIsFlowSaving: (isSaving) => set({ isFlowSaving: isSaving }),

  setExecutionState: (executionState) => set({ executionState }),
  
  setExecutionGroup: (executionGroup) => set({ executionGroup }),

  setProjectInfo: (projectInfo) => set({ projectInfo: projectInfo }),
}));
