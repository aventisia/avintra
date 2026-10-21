import { Badge } from "@avplatform/ui/badge";
import { Mic } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { useFetchChatAgents } from "@/features/04-assist/my-chats/hooks/useFetchChatAgents";
import type { AssistChatDto } from "@/features/04-assist/my-chats/dtos/assist-chat-dto";
import { VoicePlatformAssistantUI } from "@/react-toolkit/features/voice-platform-assistant-ui/components/VoicePlatformAssistantUI";

const findAgent = (
  activeAgents: AssistChatDto[] | undefined,
  archivedAgents: AssistChatDto[] | undefined,
  flowVersionId: string,
): AssistChatDto | undefined =>
  activeAgents?.find((item) => item.id === flowVersionId) ??
  archivedAgents?.find((item) => item.id === flowVersionId);

/** Voice route section: agent picker or the voice surface for the selected agent. */
export const VoiceSection = () => {
  const { flowVersionId } = useParams<{ flowVersionId?: string }>();
  const { active, archived } = useFetchChatAgents();
  const activeAgents = active.data?.data;
  const archivedAgents = archived.data?.data;

  const agent = useMemo(
    () => (flowVersionId ? findAgent(activeAgents, archivedAgents, flowVersionId) : undefined),
    [activeAgents, archivedAgents, flowVersionId],
  );

  const initialMessages = useMemo(() => {
    const introduction = agent?.voiceIntroduction?.trim();

    if (agent?.firstSpeaker !== "ai" || !introduction) return [];

    return [{ role: "assistant" as const, content: introduction }];
  }, [agent?.firstSpeaker, agent?.voiceIntroduction]);

  if (!flowVersionId) {
    return (
      <VoiceAgentPicker
        agents={activeAgents ?? []}
        isLoading={active.isLoading}
        isError={active.isError}
      />
    );
  }

  const isLoading = active.isLoading || archived.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading agent…</p>
      </div>
    );
  }

  if (!agent) {
    return <UnknownVoiceAgent />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-3 h-16 min-h-16 max-h-16 border-b flex items-center gap-3">
        <Mic className="h-4 w-4 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{agent.name}</span>

            <Badge className="px-2 py-0 rounded-full text-2xs bg-slate-200 text-secondary font-medium">
              v{agent.versionNumber}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 pr-2">
            {agent.description}
          </p>
        </div>

        <Link to="/assist/voice" className="shrink-0 text-xs text-muted-foreground hover:underline">
          All voice agents
        </Link>
      </div>

      <div className="h-[calc(100%-4rem)] w-full">
        <VoicePlatformAssistantUI
          flowVersionId={agent.id}
          agent={agent}
          title={agent.name}
          badge="Voice"
          description={agent.description ?? ""}
          defaultActions={agent.defaultActions ?? []}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
};

const VoiceAgentPicker = ({
  agents,
  isLoading,
  isError,
}: {
  agents: AssistChatDto[];
  isLoading: boolean;
  isError: boolean;
}) => (
  <div className="flex flex-col h-full w-full">
    <div className="px-3 h-16 min-h-16 max-h-16 border-b flex items-center gap-3">
      <Mic className="h-4 w-4 shrink-0" />

      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold">Voice</span>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose an agent to start a hands-free voice session.
        </p>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-3">
      {isLoading && <p className="text-sm text-muted-foreground">Loading agents…</p>}

      {!isLoading && isError && (
        <p className="text-sm text-destructive">Could not load voice agents. Try again later.</p>
      )}

      {!isLoading && !isError && agents.length === 0 && (
        <p className="text-sm text-muted-foreground">No voice agents are available yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            to={`/assist/voice/${agent.id}`}
            className="flex items-start gap-3 rounded-md border px-3 py-2 hover:bg-muted"
          >
            <Mic className="mt-0.5 h-4 w-4 shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{agent.name}</span>

                <Badge className="px-2 py-0 rounded-full text-2xs bg-slate-200 text-secondary font-medium">
                  v{agent.versionNumber}
                </Badge>
              </div>

              {agent.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {agent.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

const UnknownVoiceAgent = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
    <p className="text-sm font-medium">This voice agent is not available.</p>
    <p className="text-xs text-muted-foreground">
      It may have been archived or removed. Choose another agent to start a voice session.
    </p>
    <Link to="/assist/voice" className="text-sm text-primary hover:underline">
      Back to voice agents
    </Link>
  </div>
);
