import { FlowTypesEnum } from "@avplatform/ui/enums";
import { create } from "zustand";

import { ExecutionStateType } from "@/features/execute-flow/types/execution-state-type";

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
  accessType?: string;
  inputOutputObject?: string;
  jobId?: string;
  /**
   * Root flow version id that owns the current local run's logs. Set when a run starts,
   * and carried through sub-flow navigation so sub-flow nodes can restore/persist logs
   * against the parent version (sub-flow logs are stored under the root run version).
   */
  runVersionId?: string;
  /**
   * Root flow id of the current local run. `id`/`versionId` always describe the *current*
   * (sub-)flow, so the root flow id is tracked separately to survive sub-flow navigation.
   */
  runFlowId?: string;
  /** ID of the space this flow belongs to (null/undefined = Central). */
  spaceId?: string | null;
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

  /** Flag to indicate if flow type is ChatAgent */
  isChatAgent: boolean;

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
  setConditionalExecutionGroup: (conditionalExecutionGroup: ConditionalExecutionGroup[]) => void;

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
    inputOutputObject: "",
    jobId: "",
    runVersionId: "",
    runFlowId: "",
    spaceId: null,
  },

  isChatAgent: false,

  isFlowLoading: false,
  isFlowSaving: false,
  executionState: "stopped",
  conditionalExecutionGroup: [],
  loopExecutionGroup: [],

  setCurrentFlow: (flowDetails) =>
    set({
      currentFlow: flowDetails,
      isChatAgent: flowDetails.type === FlowTypesEnum.ChatAgent,
    }),

  setIsFlowLoading: (isLoading) => set({ isFlowLoading: isLoading }),

  setIsFlowSaving: (isSaving) => set({ isFlowSaving: isSaving }),

  setExecutionState: (executionState) => set({ executionState }),

  setConditionalExecutionGroup: (conditionalExecutionGroup) => set({ conditionalExecutionGroup }),

  setLoopExecutionGroup: (loopExecutionGroup) => set({ loopExecutionGroup }),
}));
