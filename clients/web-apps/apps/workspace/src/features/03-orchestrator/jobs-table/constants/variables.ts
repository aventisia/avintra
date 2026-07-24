import { DialogCrudAction } from "@avplatform/ui/types";

import { JobStatusEnum } from "..";

/**
 * Default JSON payload shown in the create job form. It acts as a placeholder
 * example; if the user does not edit it, it will not be submitted to the API.
 */
const DEFAULT_JOB_INPUT_DATA = JSON.stringify(
  {
    exampleKey: "exampleValue",
  },
  null,
  2,
);

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

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
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

/**
 * The job statuses that can be selected when manually closing a job from the edit form.
 */
const CLOSING_JOB_STATUSES = [
  JobStatusEnum.Completed,
  JobStatusEnum.Failed,
  JobStatusEnum.Aborted,
  JobStatusEnum.Canceled,
  JobStatusEnum.Killed,
];

export {
  DEFAULT_JOB_INPUT_DATA,
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  HISTORY_JOB_STATUSES,
  CLOSING_JOB_STATUSES,
  getDialogHeadingDescription,
};
