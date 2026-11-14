import { VoiceCallView, useLiveVoiceCall } from "@avplatform/assistant-chat";
import { EmptyState } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import {
  ArrowLeftIcon,
  CircleNotchIcon,
  RobotIcon,
  UserIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";

import { useFetchChatAgents } from "@/features/04-assist/my-chats/hooks/useFetchChatAgents";

import type { AssistChatDto } from "../../my-chats/dtos/assist-chat.dto";
import { createVoiceSession } from "../apis/voice-session.apis";

const VOICE_HOME = "/assist/voice";

/** Voice route section: published VoiceAgent picker, or the call screen for the selected agent. */
export const VoiceSection = () => {
  const { flowVersionId } = useParams<{ flowVersionId?: string }>();
  const { active } = useFetchChatAgents();

  const agents = (active.data?.data ?? []).filter(
    (agent) => agent.flowType === FlowTypesEnum.VoiceAgent,
  );
  const selectedAgent = flowVersionId
    ? agents.find((agent) => agent.id === flowVersionId)
    : undefined;

  if (selectedAgent) return <VoiceCallScreen key={selectedAgent.id} agent={selectedAgent} />;
  if (active.isError) return <VoiceLoadError onRetry={() => void active.refetch()} />;
  if (active.isLoading) return <VoiceLoading />;
  if (flowVersionId) return <UnknownVoiceAgent />;

  return <VoiceAgentPicker agents={agents} />;
};

const VoiceCallScreen = ({ agent }: { agent: AssistChatDto }) => {
  const call = useLiveVoiceCall({
    flowVersionId: agent.id,
    mode: "live",
    createSession: async (request) => {
      const response = await createVoiceSession({ ...request, mode: "live" });
      if (!response.data)
        throw new Error(response.message || "Voice session could not be started.");
      return response.data;
    },
  });

  return (
    <VoiceCallView
      call={call}
      agentName={agent.name}
      variant="full"
      idleTitle={`Talk to ${agent.name}`}
      idleDescription={
        agent.firstSpeaker === "ai"
          ? "The agent greets you when the call connects."
          : "Start speaking when the call connects."
      }
      header={
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
          <Link
            to={VOICE_HOME}
            aria-label="All voice agents"
            className="grid size-8 shrink-0 place-items-center rounded-md text-ink-2 hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-body font-semibold text-ink">{agent.name}</h1>
              <Badge variant="outline" className="tabular-nums">
                v{agent.versionNumber}
              </Badge>
            </div>
            {agent.description && (
              <p className="truncate text-hint text-muted-foreground">{agent.description}</p>
            )}
          </div>
        </header>
      }
    />
  );
};

const VoiceAgentCard = ({ agent }: { agent: AssistChatDto }) => {
  const SpeakerIcon = agent.firstSpeaker === "ai" ? RobotIcon : UserIcon;

  return (
    <Link
      to={`${VOICE_HOME}/${agent.id}`}
      className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 hover:border-line-strong hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
    >
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-text">
          <WaveformIcon aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink">
          {agent.name}
        </span>
        <Badge variant="outline" className="tabular-nums">
          v{agent.versionNumber}
        </Badge>
      </div>
      {agent.description && (
        <p className="line-clamp-2 text-body-sm text-ink-2">{agent.description}</p>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-hint text-muted-foreground">
        <span className="flex items-center gap-1">
          <SpeakerIcon aria-hidden="true" className="size-3.5" />
          {agent.firstSpeaker === "ai" ? "Agent speaks first" : "You speak first"}
        </span>
      </div>
    </Link>
  );
};

const VoiceAgentPicker = ({ agents }: { agents: AssistChatDto[] }) => (
  <div className="flex h-full w-full flex-col bg-bg">
    <div className="border-b border-line bg-surface px-4 py-3">
      <h1 className="text-heading text-ink">Voice</h1>
      <p className="text-hint text-muted-foreground">
        Choose a published agent to start a hands-free call.
      </p>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
      {agents.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <VoiceAgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <EmptyState
          Icon={WaveformIcon}
          primaryMessage="No voice agents available"
          secondaryMessage="Ask your admin to publish a voice agent and assign it to you."
          className="h-full"
        />
      )}
    </div>
  </div>
);

const VoiceLoading = () => (
  <div className="flex h-full w-full items-center justify-center gap-2 text-body-sm text-muted-foreground">
    <CircleNotchIcon
      aria-hidden="true"
      className="size-4 animate-spin motion-reduce:animate-none"
    />
    Loading voice agents…
  </div>
);

const VoiceLoadError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
    <p role="alert" className="text-body font-semibold text-ink">
      Voice agents could not be loaded.
    </p>
    <Button variant="outline" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

const UnknownVoiceAgent = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
    <p className="text-body font-semibold text-ink">This voice agent is not available.</p>
    <p className="text-hint text-muted-foreground">
      It may have been archived or removed. Choose another agent to start a call.
    </p>
    <Link to={VOICE_HOME} className="text-body-sm text-primary-text hover:underline">
      Back to voice agents
    </Link>
  </div>
);
