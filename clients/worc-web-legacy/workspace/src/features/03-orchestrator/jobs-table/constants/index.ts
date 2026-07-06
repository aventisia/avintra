import { JobStatusTypesEnum } from "../enums/job-status-type-enum";

/**
 * The unique key for the jobs query to be used in the query client. ["jobs"]
 */
const DATA_QUERY_KEY = ["jobs"];

/**
 * The heading for the jobs table.
 */
const TABLE_HEADING = "Jobs";

const TABLE_KEY = "jobs";

const HISTORY_JOB_STATUSES = [
  JobStatusTypesEnum.Completed,
  JobStatusTypesEnum.Failed,
  JobStatusTypesEnum.Abort,
  JobStatusTypesEnum.Killed,
];

/**
 * The column used for searching in the jobs.
 */
const SEARCH_COLUMN = "name";

export {
  DATA_QUERY_KEY,
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
  HISTORY_JOB_STATUSES,
};
