import { create } from "zustand";

//heading while selecting the assign flow or assing aggent from the row action
export type assignmentType = "Flow" | "Agent" | undefined;

type State = {
    typeOfAssignment: assignmentType;
    isDialogOpen: boolean;
    isFormDirty: boolean;
    machineId: string;
};

type Actions = {
    setTypeOfAssignment: (heading: assignmentType) => void;
    setIsDialogOpen: (isDialogOpen: boolean) => void;
    setMachineId: (id: string) => void;
    toggleFormDirty: (isFormDirty: boolean) => void;
};

export const useMachineAssignmentStore = create<State & Actions>((set) => ({
    typeOfAssignment: undefined,
    isDialogOpen: false,
    isFormDirty: false,
    machineId: window.crypto.randomUUID(),

    setTypeOfAssignment: (heading) => set({ typeOfAssignment: heading }),
    setIsDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
    toggleFormDirty: (isFormDirty) => set({ isFormDirty }),
    setMachineId: (id) => set({ machineId: id }),
}));
