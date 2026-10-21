import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

/**
 * The unique key for the resource flow query to be used in the query client.
 */
const RESOURCE_FLOW_KEY = "RESOURCE_FLOW";

/**
 * The unique key for the assignable agent search query to be used in the query client.
 */
const RESOURCE_FLOW_SEARCH_KEY = "RESOURCE_FLOW_SEARCH";

/**
 * The maximum number of flows the backend accepts in a single assignment.
 */
const MAX_RESOURCE_FLOWS = 100;

/**
 * The flow types that can be assigned to a resource.
 */
const ASSIGNABLE_FLOW_TYPES = [FlowTypesEnum.Agent, FlowTypesEnum.ChatAgent];

/**
 * Motion transition shared by the access panels and allow-list rows.
 */
const PANEL_TRANSITION = { duration: 0.22, ease: [0.32, 0.72, 0, 1] } as const;

export {
  ASSIGNABLE_FLOW_TYPES,
  MAX_RESOURCE_FLOWS,
  PANEL_TRANSITION,
  RESOURCE_FLOW_KEY,
  RESOURCE_FLOW_SEARCH_KEY,
};
