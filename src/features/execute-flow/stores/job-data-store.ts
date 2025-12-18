import { create } from "zustand";

import { JobStatusTypesEnum } from "@/features/orchestrator/jobs-table/enums/job-status-type-enum";

type JobState = {
  status: JobStatusTypesEnum;
  endTime: Date;
  startTime: Date;
};

type JobActions = {
  setJob: (jobData: JobState) => void;
  updateField: <K extends keyof JobState>(field: K, value: JobState[K]) => void;
  resetJob: () => void;
};

const defaultJobState: JobState = {
  status: JobStatusTypesEnum.Created,
  endTime: new Date(),
  startTime: new Date(),
};

export const useJobDataStore = create<JobState & JobActions>((set) => ({
  ...defaultJobState,

  setJob: (jobData) => set({ ...jobData }),

  updateField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  resetJob: () => set({ ...defaultJobState }),
}));
