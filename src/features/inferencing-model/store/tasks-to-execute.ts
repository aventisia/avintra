import { create } from "zustand"

interface TasksState {
  listOfTasksId: string[]
}

interface TasksActions {
  toggleTaskId: (id: string, checked: boolean) => void
}

export const useTasksToExecuteStore = create<TasksState & TasksActions>((set) => ({
  listOfTasksId: [],
  toggleTaskId: (id, checked) =>
    set((state) => ({
      listOfTasksId: checked
        ? [...state.listOfTasksId, id] // Add if checked
        : state.listOfTasksId.filter(taskId => taskId !== id), // Remove if unchecked
    })),
}))
