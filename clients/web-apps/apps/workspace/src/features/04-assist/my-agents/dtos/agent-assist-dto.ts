/**
 * Data transfer object for Agents to assigned to the machine.
 */
export interface AgentsAssistDto {
  /**
   * Gets or sets Id of the agent.
   */
  id: string;
  /**
   * Gets or sets Id of the tenant.
   */
  tenantId: string;
  /**
   * Gets or sets Id of the machine id.
   */
  machineId: string;
  /**
   * Gets or sets the name of the agent.
   */
  name: string;
  /**
   * Gets or sets the description of the agent.
   */
  description?: string;
  /**
   * Gets or sets the type of the agent (Agent / ChatAgent).
   */
  type?: string;
  /**
   * Gets or sets the queues linked to the agent.
   */
  queues?: AgentQueueDto[];
  /**
   * Gets or sets the distinct AI model names referenced by the agent's workflow.
   */
  aiModels?: string[];

  status: string;
  /**
   * Get or set disable
   */
  isDisabled: boolean;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy: string;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn: Date;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy: string;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn: Date;
  /**
   * Gets or sets initials of the user who created the record
   */
  createdByUserInitials: string;
  /**
   * Gets or sets the version number of a agent
   */
  versionNumber: number;
  /**
   * Gets or sets a value indicating whether the agent version is assigned.
   */
  isAssigned: boolean;

  jobId?: string;

  /**
   * Gets or sets the list of machine ids the agent is assigned to.
   */
  assignedMachineIds?: string[];

  /**
   * Gets or sets the comma-separated platforms the agent supports (for example "cloud" or
   * "windows").
   */
  supportedPlatform?: string;
}

/**
 * Lightweight data transfer object describing a queue linked to an agent (flow version).
 */
export interface AgentQueueDto {
  /**
   * Gets or sets the Id of the queue.
   */
  id: string;
  /**
   * Gets or sets the name of the queue.
   */
  name: string;
  /**
   * Gets or sets the type of the queue (Agent / User).
   */
  type?: string;
}
