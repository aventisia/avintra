import { create } from "zustand";
import { ExecutionStatusTypesEnum } from "../constants/execution-status-type-enum";

type ExecutionState = {
  status: ExecutionStatusTypesEnum;
  endTime: Date;
  startTime: Date;
};

type ExecutionActions = {
  setExecution: (execution: ExecutionState) => void;
  updateField: <K extends keyof ExecutionState>(
    field: K,
    value: ExecutionState[K],
  ) => void;
  resetExecution: () => void;
};

const defaultExecutionState: ExecutionState = {
  status: ExecutionStatusTypesEnum.Succeeded,
  endTime: new Date(),
  startTime: new Date(),
};

export const useExecutionLogTableStore = create<
  ExecutionState & ExecutionActions
>((set) => ({
  ...defaultExecutionState,

  setExecution: (execution) => set({ ...execution }),

  updateField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  resetExecution: () => set({ ...defaultExecutionState }),
}));
