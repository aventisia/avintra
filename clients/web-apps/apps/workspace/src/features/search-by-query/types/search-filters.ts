/**
 * Filters used when searching for published agent flow versions in the
 * create/update job form. The selected machine narrows the available agents.
 */
export interface FlowVersionSearchQueryFilters {
  /** Optional machine identifier to only return flow versions linked to it. */
  machineId: string | null;
}

/**
 * Filters used when searching for registered machines in the create/update job
 * form. The selected flow version narrows the available machines.
 */
export interface MachineSearchQueryFilters {
  /** Optional flow version identifier to only return machines linked to it. */
  flowVersionId: string | null;
}
