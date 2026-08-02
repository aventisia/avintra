/**
 * Strongly-typed permission set for an API key.
 *
 * Each flag represents a specific feature that the key is allowed to use.
 * Defaults are controlled by the form helpers; the backend stores these as a
 * fixed object rather than a dynamic JSON document.
 */
export interface ApiKeyPermissions {
  /** Allow desktop executors to authenticate machines using this key. */
  machineAuth: boolean;

  /** Allow external apps to trigger webhook-based jobs with this key. */
  webhookTrigger: boolean;

  /** Allow posting new work items to queues using this key. */
  createQueueWorkItem: boolean;

  /** Allow synchronous execution of published agents via API using this key. */
  cloudExecution: boolean;
}
