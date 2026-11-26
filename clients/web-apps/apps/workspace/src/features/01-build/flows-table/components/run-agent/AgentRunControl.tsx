import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PlayIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import {
  ExecutionAction,
  getAgentStatusLabel,
  isAgentRunning,
} from "@/features/04-assist/my-agents";

import { AgentRun } from "../../types/agent-row.type";

const getRunPath = (kind: AgentRun["kind"]) =>
  kind === "voice" ? "/assist/voice" : "/assist/chats";

type AgentRunControlProps = {
  run: AgentRun;
  flowName: string;
};

/**
 * Run action of a row assigned to the user: Execute/Abort for an automation agent, or a link into
 * the existing chat or voice experience for a shared chat/voice agent.
 */
export const AgentRunControl = ({ run, flowName }: AgentRunControlProps) => {
  const navigate = useNavigate();

  if (run.kind === "automation") {
    return (
      <ExecutionAction
        executionState={run.status ?? "Offline"}
        rowId={run.versionId}
        flowName={flowName}
        flowVersionNumber={run.versionNumber}
        supportedPlatform={run.supportedPlatform}
        jobId={run.jobId}
      />
    );
  }

  return (
    <Tooltip content="Run">
      <Button
        variant="ghost"
        size="icon8"
        className="hover:bg-hover"
        onClick={() => navigate(`${getRunPath(run.kind)}/${run.versionId}`)}
      >
        <PlayIcon className="h-[1.125rem] w-[1.125rem] text-ok" />
      </Button>
    </Tooltip>
  );
};

/** Live machine status of an assigned automation agent. */
export const AgentStatusBadge = ({ status }: { status?: string }) => {
  if (!status) return <span className="text-muted-foreground">-</span>;

  return (
    <Badge variant={isAgentRunning({ status }) ? "running" : "queued"}>
      {getAgentStatusLabel({ status })}
    </Badge>
  );
};
