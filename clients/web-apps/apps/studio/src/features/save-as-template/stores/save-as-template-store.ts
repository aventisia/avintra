import { create } from "zustand";

import { ValidateTemplateDto } from "../dto/validate-template-dto";

type State = {
  showDialog: boolean;
  validationStatus: ValidateTemplateDto[];
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setValidationStatus: (validationStatus: ValidateTemplateDto[]) => void;
};

export const useSaveAsTemplateStore = create<State & Actions>((set) => ({
  showDialog: false,
  validationStatus: [],

  setShowDialog: (showDialog) => set({ showDialog }),
  setValidationStatus: (validationStatus) => set({ validationStatus }),
}));
