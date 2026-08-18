import { FlowTypesEnum } from "@avplatform/ui/enums";

import { ExecutionSettings } from "@/features/flow-settings/types/setting-types";

/** To get flow props to load when user opens a flow in studio */
export interface LoadFlowDto {
  /** Flow record's primary key (Guid). FlowId */
  id: string;

  /** Flow's name */
  name: string;

  /** Version id */
  versionId: string;

  /** Version no */
  versionNumber: number;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  /** Output Variables object, i..e the Flow Variables */
  flowVariablesObject: string;

  /** Flow's inputs outputs JSON data in string format */
  inputOutputObject?: string;

  /** Gets or sets a value indicating whether the version has been published. */
  isPublished: boolean;

  /** Gets or sets a value indicating whether the version is in locked state. */
  isLocked: boolean;

  /** Gets or sets a value indicating whether the version is in draft state. */
  isDraft: boolean;

  /** Gets or sets a value indicating whether the version has been archived. */
  isArchived: boolean;

  /** Gets or sets the type of the flow.  c*/
  type: FlowTypesEnum;

  /** Gets or sets the ID of the space this flow belongs to (null = Central). */
  spaceId?: string | null;

  /** Gets or sets the description of the flow */
  description?: string;

  /** Gets or sets the permission level granted to the user. */
  accessLevel?: string;

  /** Gets or sets the supported platforms for the flow version as a comma-separated string. */
  supportedPlatform?: string;

  /** Gets or sets the maximum allowed execution time in minutes. */
  settings?: ExecutionSettings;
}
