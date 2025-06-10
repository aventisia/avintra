import { create } from "zustand";

type State = {
  id: string;
};

type Actions = {
  setRescheduleId: (fileIds: string) => void;
};

export const useRescheduleFineTuneStore = create<State & Actions>((set) => ({
  id: "",

  setRescheduleId: (id) =>
    set(() => ({
        id: id,
    })),
}));
