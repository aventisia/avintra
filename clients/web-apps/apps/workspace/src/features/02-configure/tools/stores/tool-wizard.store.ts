import { type DialogCrudAction } from "@avplatform/ui/types";
import { create } from "zustand";

import { ToolDto } from "../dtos/index";

type WizardStep = "ingest" | "authenticate" | "playground";

interface ToolWizardState {
  currentStep: WizardStep;
  crudAction?: DialogCrudAction;
  draftTool?: ToolDto;
  isDraftSaved: boolean;
  specText: string;
  specFile?: File;
  isNameAvailable: boolean;
  isNameCheckPending: boolean;
  nameAvailabilityMessage: string | null;
  setCurrentStep: (step: WizardStep) => void;
  setCrudAction: (action?: DialogCrudAction) => void;
  setDraftTool: (tool?: ToolDto) => void;
  setDraftSaved: (saved: boolean) => void;
  setSpecText: (text: string) => void;
  setSpecFile: (file?: File) => void;
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
  specText: "",
  specFile: undefined,
  isNameAvailable: true,
  isNameCheckPending: false,
  nameAvailabilityMessage: null,
};

export const useToolWizardStore = create<ToolWizardState>((set) => ({
  ...initialState,
  setCurrentStep: (step) => set({ currentStep: step }),
  setCrudAction: (action) => set({ crudAction: action }),
  setDraftTool: (tool) => set({ draftTool: tool }),
  setDraftSaved: (saved) => set({ isDraftSaved: saved }),
  setSpecText: (text) => set({ specText: text }),
  setSpecFile: (file) => set({ specFile: file }),
  setNameAvailability: ({ isAvailable, isCheckPending, message }) =>
    set({ isNameAvailable: isAvailable, isNameCheckPending: isCheckPending, nameAvailabilityMessage: message }),
  reset: () => set(initialState),
}));
