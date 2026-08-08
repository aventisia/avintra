import type { PermissionItem } from "../types/api-key-permission.type";

/**
 * Fixed feature-level permissions that can be enabled or disabled for an API key.
 */
export const API_KEY_PERMISSION_ITEMS: PermissionItem[] = [
  {
    id: "machineAuth",
    label: "Machine Authentication",
    description: "Allow runner apps to authenticate machines using this key.",
  },
  {
    id: "webhookTrigger",
    label: "Webhook trigger",
    description: "Allow external apps to trigger webhook-based jobs with this key.",
  },
  {
    id: "createQueueWorkItem",
    label: "Create queue work item",
    description: "Allow posting new work items to queues using this key.",
  },
  {
    id: "cloudExecution",
    label: "Cloud Execution",
    description: "Allow synchronous execution of published agents via API using this key.",
  },
];
