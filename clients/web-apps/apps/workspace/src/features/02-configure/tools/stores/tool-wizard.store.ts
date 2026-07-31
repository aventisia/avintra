import { create } from "zustand";

import { ToolDto } from "../dtos/index";

type WizardStep = "ingest" | "authenticate" | "playground";

interface ToolWizardState {
  currentStep: WizardStep;
  draftTool?: ToolDto;
  specText: string;
  specFile?: File;
  setCurrentStep: (step: WizardStep) => void;
  setDraftTool: (tool?: ToolDto) => void;
  setSpecText: (text: string) => void;
  setSpecFile: (file?: File) => void;
  reset: () => void;
}

const initialState = {
  currentStep: "ingest" as WizardStep,
  draftTool: undefined,
  specText: "",
  specFile: undefined,
};

export const useToolWizardStore = create<ToolWizardState>((set) => ({
  ...initialState,
  setCurrentStep: (step) => set({ currentStep: step }),
  setDraftTool: (tool) => set({ draftTool: tool }),
  setSpecText: (text) => set({ specText: text }),
  setSpecFile: (file) => set({ specFile: file }),
  reset: () => set(initialState),
}));
