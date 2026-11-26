import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

import { AgentsAssistDto } from "@/features/04-assist/my-agents";
import { AssistChatDto } from "@/features/04-assist/my-chats/dtos/assist-chat.dto";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { AccessTypeEnum } from "../constants/access-type-enum";
import { AgentRow, AgentRun } from "../types/agent-row.type";

const isChatOrVoice = (type: string | undefined) =>
  type === FlowTypesEnum.ChatAgent || type === FlowTypesEnum.VoiceAgent;

const toAutomationRun = (agent: AgentsAssistDto): AgentRun => ({
  kind: "automation",
  versionId: agent.id,
  versionNumber: agent.versionNumber,
  status: agent.status,
  jobId: agent.jobId,
  supportedPlatform: agent.supportedPlatform,
});

const toChatVoiceRun = (agent: AssistChatDto): AgentRun => ({
  kind: agent.flowType === FlowTypesEnum.VoiceAgent ? "voice" : "chat",
  versionId: agent.id,
  versionNumber: agent.versionNumber,
});

/** A row for an agent that exists only as a flow version, with no Build flow record. */
const toVersionRow = ({
  id,
  type,
  name,
  description,
  versionNumber,
  run,
  createdBy,
  createdOn,
  lastModifiedOn,
  supportedPlatform,
  aiModels,
  queues,
}: {
  id: string;
  type: FlowTypesEnum;
  name: string;
  description?: string;
  versionNumber: number;
  run: AgentRun;
  createdBy?: string;
  createdOn?: Date;
  lastModifiedOn?: Date;
  supportedPlatform?: string;
  aiModels?: string[];
  queues?: AgentRow["queues"];
}): AgentRow => ({
  id,
  type,
  name,
  description,
  versionNumber,
  isPublished: true,
  isArchived: false,
  isDisabled: false,
  supportedPlatform,
  accessType: AccessTypeEnum.View,
  accessLevel: ResourceAccessTypeEnum.View,
  isTenantWideAccess: false,
  createdBy,
  createdOn,
  lastModifiedOn,
  aiModels,
  queues,
  run,
  hasStudioLink: false,
});

type MergeAgentRowsOptions = {
  buildRows: AgentRow[];
  assignedAgents: AgentsAssistDto[];
  sharedChatAgents: AssistChatDto[];
};

/**
 * Merges the Build list with the caller's assigned automation agents and shared chat/voice
 * agents. Assigned automation rows join the Build rows by flow id; a chat/voice row joins its
 * Build row by type and name, because the Build list carries no version id.
 */
export const mergeAgentRows = ({
  buildRows,
  assignedAgents,
  sharedChatAgents,
}: MergeAgentRowsOptions): AgentRow[] => {
  const rows = buildRows.map((row) => ({ ...row }));
  const rowByFlowId = new Map(rows.map((row) => [row.id, row]));

  const assignedByFlowId = new Map<string, AgentsAssistDto>();
  assignedAgents.forEach((agent) => {
    if (!isChatOrVoice(agent.type) && !assignedByFlowId.has(agent.refId)) {
      assignedByFlowId.set(agent.refId, agent);
    }
  });

  assignedByFlowId.forEach((agent, flowId) => {
    const buildRow = rowByFlowId.get(flowId);
    if (buildRow) {
      buildRow.run = toAutomationRun(agent);
      return;
    }

    const row = toVersionRow({
      id: agent.refId,
      type: agent.type as FlowTypesEnum,
      name: agent.name,
      description: agent.description,
      versionNumber: agent.versionNumber,
      run: toAutomationRun(agent),
      createdBy: agent.createdBy,
      createdOn: agent.createdOn ? new Date(agent.createdOn) : undefined,
      lastModifiedOn: agent.lastModifiedOn ? new Date(agent.lastModifiedOn) : undefined,
      supportedPlatform: agent.supportedPlatform,
      aiModels: agent.aiModels,
      queues: agent.queues,
    });
    rows.push(row);
    rowByFlowId.set(row.id, row);
  });

  sharedChatAgents.forEach((agent) => {
    // shortcut: the active chat/voice list carries no parent flow id, so a row matches a Build
    // row by type and name; upgrade when the API returns the flow id.
    const buildRow = rows.find(
      (row) =>
        row.hasStudioLink !== false && row.type === agent.flowType && row.name === agent.name,
    );
    if (buildRow) {
      if (!buildRow.run) buildRow.run = toChatVoiceRun(agent);
      return;
    }

    rows.push(
      toVersionRow({
        id: agent.id,
        type: agent.flowType,
        name: agent.name,
        description: agent.description ?? undefined,
        versionNumber: agent.versionNumber,
        run: toChatVoiceRun(agent),
        lastModifiedOn: agent.lastModifiedOn ? new Date(agent.lastModifiedOn) : undefined,
      }),
    );
  });

  return rows;
};
