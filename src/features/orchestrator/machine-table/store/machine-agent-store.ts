import type { MachineTaskTypesEnum } from "@/react-toolkit/enums/machine-task-types-enum";
import { create } from "zustand";

type State = {
    typeOfAssignment: MachineTaskTypesEnum | undefined;
    isDialogOpen: boolean;
    isFormDirty: boolean;
    machineId: string;
};

type Actions = {
    setTypeOfAssignment: (heading: MachineTaskTypesEnum) => void;
    setIsDialogOpen: (isDialogOpen: boolean) => void;
    setMachineId: (id: string) => void;
    toggleFormDirty: (isFormDirty: boolean) => void;
};

export const useMachineAgentStore = create<State & Actions>((set) => ({
    typeOfAssignment: undefined,
    isDialogOpen: false,
    isFormDirty: false,
    machineId: window.crypto.randomUUID(),

    setTypeOfAssignment: (heading) => set({ typeOfAssignment: heading }),
    setIsDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
    toggleFormDirty: (isFormDirty) => set({ isFormDirty }),
    setMachineId: (id) => set({ machineId: id }),
}));
