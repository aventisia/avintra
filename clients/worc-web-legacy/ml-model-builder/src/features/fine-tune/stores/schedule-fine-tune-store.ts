import { create } from "zustand";

type State = {
  fileIds: string[];
};

type Actions = {
  setSelectedFileIds: (fileIds: string[]) => void;
};

export const useScheduleFineTuneStore = create<State & Actions>((set) => ({
  fileIds: [],

  setSelectedFileIds: (fileIds) =>
    set(() => ({
      fileIds: fileIds,
    })),
}));
