import { create } from "zustand";

interface SelectedTaskState {
  selectedTask: string;
  setSelectedTask: (task: string) => void;
}

export const useSelectedTaskStore = create<SelectedTaskState>((set) => ({
  selectedTask: "",
  setSelectedTask: (task) => set({ selectedTask: task }),
}));
