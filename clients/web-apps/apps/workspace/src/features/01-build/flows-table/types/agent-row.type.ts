import { FlowsTableDto } from "../dtos/flows-table-dto";

/** What running a row does: a job for an automation agent, a chat or a voice session otherwise. */
export type AgentRunKind = "automation" | "chat" | "voice";

/** Run action of a row the user may run: the version to execute or open, with its machine status. */
export type AgentRun = {
  kind: AgentRunKind;
  versionId: string;
  versionNumber: number;
  status?: string;
  jobId?: string;
  supportedPlatform?: string;
};

/**
 * An agent row on the merged Agents page. It is a Build row, an assigned automation agent, or a
 * shared chat/voice agent; the last two exist only as a flow version.
 */
export type AgentRow = FlowsTableDto & {
  run?: AgentRun;
  /** False when the row has no flow record behind it, so its name cannot open the Agent Builder. */
  hasStudioLink?: boolean;
};
