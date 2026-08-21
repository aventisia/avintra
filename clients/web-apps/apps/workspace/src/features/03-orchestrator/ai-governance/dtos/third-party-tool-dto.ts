/**
 * A third-party tool used by the agent, resolved from the flow config at save-time.
 */
export interface ThirdPartyToolDto {
  /** The tool name. */
  tool: string;
  /** The credential name referenced by the node. */
  credentialName: string;
  /** The actions configured on the tool (comma-separated). */
  actions: string;
  /** Whether due diligence has been completed (human input). */
  isDueDiligenceCompleted: boolean;
  /** Due-diligence status text (human input). */
  dueDiligenceStatus: string;
  /** Specific risks associated with this tool (human input). */
  risks: string;
  /** Mitigations for the above risks (human input). */
  mitigations: string;
}
