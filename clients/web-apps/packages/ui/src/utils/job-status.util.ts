import { JobStatusEnum } from "../enums/job-status.enum";

const ERROR_STATUSES: JobStatusEnum[] = [
  JobStatusEnum.Failed,
  JobStatusEnum.Aborted,
  JobStatusEnum.Killed,
];

/** Canceled stays neutral; Failed, Aborted and Killed count as errors in filters and counts. */
export const isErrorStatus = (status: JobStatusEnum) => ERROR_STATUSES.includes(status);
