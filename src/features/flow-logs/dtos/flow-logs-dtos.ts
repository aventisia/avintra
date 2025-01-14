/**
 * Represents a data transfer object (DTO) for a flow log.
 */
export interface FlowLogsDTO {
  /**
   * Gets or sets the name of the flow.
   */
  flowName: string;
  /**
   * Gets or sets the id of the flow.
   */
  flowId: string;

  /**
   * Gets or sets the version of the flow.
   */
  version: string;

  /**
   * Gets or sets the status of the flow.
   */
  status: string;

  /**
   * Gets or sets the start time of the flow.
   */
  startTime: string;

  /**
   * Gets or sets the duration of the flow.
   */
  duration: string;

  /**
   * Gets or sets any additional remarks for the flow.
   */
  remark: string;
}
