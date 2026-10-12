import { type DialogCrudAction } from "@avplatform/ui/types";
import { create } from "zustand";

import { ToolDto } from "../dtos/index";

type WizardStep = "ingest" | "authenticate" | "playground";

type OperationParameters = Record<string, unknown>;

interface ToolWizardState {
  currentStep: WizardStep;
  crudAction?: DialogCrudAction;
  draftTool?: ToolDto;
  isDraftSaved: boolean;
  pendingVerifications: Record<string, OperationParameters>;
  resetVersion: number;
  isNameAvailable: boolean;
  isNameCheckPending: boolean;
  nameAvailabilityMessage: string | null;
  setCurrentStep: (step: WizardStep) => void;
  setCrudAction: (action?: DialogCrudAction) => void;
  setDraftTool: (tool?: ToolDto) => void;
  setDraftSaved: (saved: boolean) => void;
  setPendingVerification: (operationId: string, parameters: OperationParameters) => void;
  setNameAvailability: (state: {
    isAvailable: boolean;
    isCheckPending: boolean;
    message: string | null;
  }) => void;
  reset: () => void;
}

const initialState = {
  currentStep: "ingest" as WizardStep,
  crudAction: undefined as DialogCrudAction | undefined,
  draftTool: undefined,
  isDraftSaved: false,
  pendingVerifications: {} as Record<string, OperationParameters>,
  isNameAvailable: true,
  isNameCheckPending: false,
  nameAvailabilityMessage: null,
};

export const useToolWizardStore = create<ToolWizardState>((set) => ({
  ...initialState,
  resetVersion: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  setCrudAction: (action) => set({ crudAction: action }),
  setDraftTool: (tool) => set({ draftTool: tool, isDraftSaved: false }),
  setDraftSaved: (saved) => set({ isDraftSaved: saved }),
  setPendingVerification: (operationId, parameters) =>
    set((state) => ({
      pendingVerifications: { ...state.pendingVerifications, [operationId]: parameters },
    })),
  setNameAvailability: ({ isAvailable, isCheckPending, message }) =>
    set({
      isNameAvailable: isAvailable,
      isNameCheckPending: isCheckPending,
      nameAvailabilityMessage: message,
    }),
  reset: () =>
    set((state) => ({
      ...initialState,
      pendingVerifications: {},
      resetVersion: state.resetVersion + 1,
    })),
}));
