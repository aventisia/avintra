/**
 * Represents a data transfer object (DTO) for a Search Flow Version.
 */
export interface FlowVersionSearchResultDto {
  /**
   * ID of the flow version.
   */
  flowVersionId: string;

  /**
   * ID of the flow this version is associated with.
   */
  flowId: string;

  /**
   * Name of the flow.
   */
  flowName: string;

  /**
   * Version number.
   */
  versionNumber: number;

  /**
   * Indicates whether the version has been published.
   */
  isPublished: boolean;
}
