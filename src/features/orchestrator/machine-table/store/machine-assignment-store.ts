import { create } from "zustand";

//heading while selecting the assign flow or assing aggent from the row action
export type assignmentType = "Flow" | "Agent" | undefined;

type State = {
    typeOfAssignment: assignmentType;
};

type Actions = {
    setTypeOfAssignment: (heading: assignmentType) => void;
};

export const useMachineAssignmentStore = create<State & Actions>((set) => ({
    typeOfAssignment: "Agent",
    setTypeOfAssignment: (heading) => set({ typeOfAssignment: heading }),
}));
