import { CrudActionType } from "@aventisia/ui/types";

import { JobStatusEnum } from "..";

/**
 * The unique key for the jobs query to be used in the query client. ["jobs"]
 */
const DATA_QUERY_KEY = ["jobs"];

/**
 * The heading for the jobs table.
 */
const TABLE_HEADING = "Jobs";

/**
 * The unique key for the jobs table to be used DTColumnHeader
 */
const TABLE_KEY = "jobs";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Job", description: "" };
    case "read":
      return { heading: "Job", description: "" };
    case "update":
      return { heading: "Edit Job", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

/**
 * The job statuses that are considered as history jobs. These statuses are used to filter the jobs that are displayed in the history table.
 */
const HISTORY_JOB_STATUSES = [
  JobStatusEnum.Completed,
  JobStatusEnum.Failed,
  JobStatusEnum.Aborted,
  JobStatusEnum.Killed,
];

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  HISTORY_JOB_STATUSES,
  getDialogHeadingDescription,
};
