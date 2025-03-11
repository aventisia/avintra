import type { JobStatusTypesEnum } from "@/react-toolkit/enums/job-status-type-enum";

/**
 * Represents a data transfer object (DTO) for a job.
 */
export interface JobsTableDto {
  /**
   * Gets or sets the primary key of the job record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
 * Gets or sets the tenantId.
 *
 * Not making it required because same DTO is used for insert and update.
 */
  tenantId?: string;

  /**
* Gets or sets the tenantId.
*
* Not making it required because same DTO is used for insert and update.
*/
  flowVersionId?: string;

  /**
   * Gets or sets the name of the job. Max-255
   */
  name: string;

  /**
 * Gets or sets the number of retry count in the job.
 */
  retryCount?: number;

  /**
 * Gets or sets the status of the job.
 */
  status: JobStatusTypesEnum;

  /**
 * Gets or sets last update time of the job.
 */
  endTime: Date;


  /**
* Gets or sets last update time of the job.
*/
  startTime: Date;

  /**
* Gets or sets last update time of the job.
*/
  duration: string;

  /**
* Gets or sets version number .marker:
*/
  versionNumber: number;


  /**
   * Gets or sets a flag indicating whether the job record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true; false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the job record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the job record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the job record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the job record was last modified.
   */
  lastModifiedOn?: Date;
}
