import { JobStatusTypesEnum } from "@/features/03-orchestrator/jobs-table/enums/job-status-type-enum";

import { create } from "zustand";

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
