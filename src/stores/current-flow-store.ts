import { create } from "zustand";

interface ICurrentFlowDetails {
  id: string;
  name: string;
  //PENDING: version
}

type State = {
  /** Details of the currently opened flow */
  currentFlow: ICurrentFlowDetails;

  /** Flag to indicate if flow is loading */
  isFlowLoading: boolean;

  /** Flag to indicate if flow is saving in the background */
  isFlowSaving: boolean;

  /** Flag to indicate if flow is executing */
  isFlowExecuting: boolean;
};

type Actions = {
  /** Sets currently opened flow details */
  setCurrentFlow: (flowDetails: ICurrentFlowDetails) => void;

  /** Sets the loading state of the flow */
  setIsFlowLoading: (isLoading: boolean) => void;

  /** Sets the saving state of the flow */
  setIsFlowSaving: (isSaving: boolean) => void;

  /** Sets the executing state of the flow */
  setIsFlowExecuting: (isExecuting: boolean) => void;
};

export const useCurrentFlowStore = create<State & Actions>((set) => ({
  projectId: "",
  currentFlow: { id: "", name: "" },
  flowsQueryKey: [],
  isFlowLoading: false,
  isFlowSaving: false,
  isFlowExecuting: false,

  setCurrentFlow: (flowDetails) => set({ currentFlow: flowDetails }),

  setIsFlowLoading: (isLoading) => set({ isFlowLoading: isLoading }),

  setIsFlowSaving: (isSaving) => set({ isFlowSaving: isSaving }),

  setIsFlowExecuting: (isExecuting) => set({ isFlowExecuting: isExecuting }),
}));
