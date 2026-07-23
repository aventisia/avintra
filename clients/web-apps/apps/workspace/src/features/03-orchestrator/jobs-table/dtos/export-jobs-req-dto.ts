import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

import { JobPriorityEnum, JobStatusEnum, TriggerTypesEnum } from "..";

export interface ExportJobsReqDto {
  /** Start date for filtering jobs based on their execution time. */
  startDate?: string;

  /** End date for filtering jobs based on their execution time. */
  endDate?: string;

  /** Array of job statuses to filter the jobs. */
  statuses?: JobStatusEnum[];

  /** Array of flow version IDs to filter the jobs. */
  flowVersionIds?: string[];

  /** Array of trigger types to filter the jobs. */
  triggerTypes?: TriggerTypesEnum[];

  /** Array of execution locations to filter the jobs. */
  executionLocations?: string[];

  /** Flag to include published flows in the export. */
  includePublishedFlows?: boolean;

  /** Flag to include unpublished flows in the export. */
  includeUnpublishedFlows?: boolean;

  /** Array of flow types to filter the jobs. */
  flowTypes?: FlowTypesEnum[];

  /** Array of job priorities to filter the jobs. */
  priorities?: JobPriorityEnum[];
}
