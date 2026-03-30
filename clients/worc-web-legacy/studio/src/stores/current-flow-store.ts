import { ExecutionStateType } from "@/features/execute-flow/types/execution-state-type";
import { UserType } from "@/features/share-access/dtos/flow-user-dto";
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { create } from "zustand";

interface ICurrentFlowDetails {
  id: string;
  name: string;
  versionId: string;
  versionNumber: number;
  isPublished: boolean;
  isLocked: boolean;
  isDraft: boolean;
  isArchived: boolean;
  type: FlowTypesEnum;
  description?: string;
  accessType?: UserType;
}

interface ConditionalExecutionGroup {
  id: string;
  conditionalMode: "SwitchCase" | "NestedIfElse";
  branches: string[];
  mergeBranchesNodeId: string;
}

interface LoopExecutionGroup {
  id: string;
  loopType: "ConditionalLoop" | "ForEachLoop";
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

  conditionalExecutionGroup: ConditionalExecutionGroup[];

  loopExecutionGroup: LoopExecutionGroup[];
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

  /** Sets the conditional execution group */
  setConditionalExecutionGroup: (
    conditionalExecutionGroup: ConditionalExecutionGroup[],
  ) => void;

  /** Sets the loop execution group */
  setLoopExecutionGroup: (loopExecutionGroup: LoopExecutionGroup[]) => void;
};

export const useCurrentFlowStore = create<State & Actions>((set) => ({
  currentFlow: {
    id: "",
    name: "",
    versionId: "",
    versionNumber: 0,
    isPublished: false,
    isLocked: false,
    isDraft: false,
    isArchived: false,
    type: FlowTypesEnum.Agent, // Default to Agent, but it will be set correctly when a flow is loaded
    description: "",
  },
  isFlowLoading: false,
  isFlowSaving: false,
  executionState: "stopped",
  conditionalExecutionGroup: [],
  loopExecutionGroup: [],

  setCurrentFlow: (flowDetails) => set({ currentFlow: flowDetails }),

  setIsFlowLoading: (isLoading) => set({ isFlowLoading: isLoading }),

  setIsFlowSaving: (isSaving) => set({ isFlowSaving: isSaving }),

  setExecutionState: (executionState) => set({ executionState }),

  setConditionalExecutionGroup: (conditionalExecutionGroup) =>
    set({ conditionalExecutionGroup }),

  setLoopExecutionGroup: (loopExecutionGroup) => set({ loopExecutionGroup }),
}));
