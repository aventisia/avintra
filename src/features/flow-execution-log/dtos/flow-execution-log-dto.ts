/**
 * Represents a data transfer object (DTO) for execution logs.
 */

export interface FlowExecutionLogsDTO {
  /**
   * Gets or sets the unique id of the execution log.
   */
  id?: string;

  /**
   * Gets or sets the name of the action performed in the execution log.
   */
  actionName: string;

  /**
   * Gets or sets the input data for the execution log.
   */
  inputData: string;

  /**
   * Gets or sets the output data for the execution log.
   */
  outputData: string;

  /**
   * Gets or sets the id of the associated flow.
   */
  flowId: string;

  /**
   * Gets or sets the duration of the action execution.
   */
  duration?: string;

  /**
   * Gets or sets the status of the associated action.
   */
  status?: string;

  /**
   * Gets or sets the error message for the action execution.
   */
  errorMessage?: string;

  /**
   * Gets or sets the user who created the log (if available).
   */
  createdBy?: string | null;

  /**
   * Gets or sets the username of the user who created the log (if available).
   */
  createdByUsername?: string | null;

  /**
   * Gets or sets the creation timestamp of the execution log.
   */
  createdOn: string; //  Executed on
}
