import { IProjectInfoDTO } from "@/features/react-flow/dtos/load-flow-dto";
import { FlowStateType } from "@/types/flow-state-literal-type";
import { create } from "zustand";

interface ICurrentFlowDetails {
  id: string;
  name: string;
  // TODO: version
}

type State = {
  /** Details of the currently opened flow */
  currentFlow: ICurrentFlowDetails;

  /** Flag to indicate if flow is loading */
  isFlowLoading: boolean;

  /** Flag to indicate if flow is saving in the background */
  isFlowSaving: boolean;

  /** Indicates flow execution state */
  flowState: FlowStateType;

  projectInfo: IProjectInfoDTO
};

type Actions = {
  /** Sets currently opened flow details */
  setCurrentFlow: (flowDetails: ICurrentFlowDetails) => void;

  /** Sets the loading state of the flow */
  setIsFlowLoading: (isLoading: boolean) => void;

  /** Sets the saving state of the flow */
  setIsFlowSaving: (isSaving: boolean) => void;

  /** Sets the executing state of the flow */
  setFlowState: (flowState: FlowStateType) => void;

  /** Set Project info of the flow */
  setProjectInfo: (projectInfo : IProjectInfoDTO) => void;

};

export const useCurrentFlowStore = create<State & Actions>((set) => ({
  currentFlow: { id: "", name: "" },
  isFlowLoading: false,
  isFlowSaving: false,
  flowState: "stopped",
  projectInfo: { 
    versionId: "",
    versionNumber: null,
    name: "",
    type: "",
  },


  setCurrentFlow: (flowDetails) => set({ currentFlow: flowDetails }),

  setIsFlowLoading: (isLoading) => set({ isFlowLoading: isLoading }),

  setIsFlowSaving: (isSaving) => set({ isFlowSaving: isSaving }),

  setFlowState: (flowState) => set({ flowState }),

  setProjectInfo: (projectInfo) => set({ projectInfo : projectInfo })
}));
