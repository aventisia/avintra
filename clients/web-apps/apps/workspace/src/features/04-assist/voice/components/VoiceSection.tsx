import { VoiceCallView } from "@avplatform/assistant-chat";
import { Badge } from "@avplatform/ui/badge";
import { ArrowLeft, AudioLines, Bot, Languages, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { SAMPLE_VOICE_AGENTS } from "../constants/voice-agent-samples.constant";
import type { SampleVoiceAgent } from "../types/voice-agent-sample.type";

const VOICE_HOME = "/assist/voice";

/** Voice route section: agent picker, or the call screen for the selected agent. Uses sample agents until Phase 1. */
export const VoiceSection = () => {
  const { flowVersionId } = useParams<{ flowVersionId?: string }>();

  if (!flowVersionId) return <VoiceAgentPicker />;

  const agent = SAMPLE_VOICE_AGENTS.find((item) => item.id === flowVersionId);
  if (!agent) return <UnknownVoiceAgent />;

  return (
    <VoiceCallView
      key={agent.id}
      script={agent.script}
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
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-body font-semibold text-ink">{agent.name}</h1>
              <Badge variant="secondary">v{agent.versionNumber}</Badge>
              <Badge variant="draft">Sample</Badge>
            </div>
            <p className="truncate text-hint text-muted-foreground">
              {agent.language} · {agent.voice}
            </p>
          </div>
        </header>
      }
    />
  );
};

const VoiceAgentCard = ({ agent }: { agent: SampleVoiceAgent }) => {
  const SpeakerIcon = agent.firstSpeaker === "ai" ? Bot : UserRound;

  return (
    <Link
      to={`${VOICE_HOME}/${agent.id}`}
      className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 hover:border-line-strong hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
    >
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-text">
          <AudioLines aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink">
          {agent.name}
        </span>
        <Badge variant="draft">Sample</Badge>
      </div>
      <p className="line-clamp-2 text-body-sm text-ink-2">{agent.description}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-hint text-muted-foreground">
        <span className="flex items-center gap-1">
          <Languages aria-hidden="true" className="size-3.5" />
          {agent.language}
        </span>
        <span className="flex items-center gap-1">
          <AudioLines aria-hidden="true" className="size-3.5" />
          {agent.voice}
        </span>
        <span className="flex items-center gap-1">
          <SpeakerIcon aria-hidden="true" className="size-3.5" />
          {agent.firstSpeaker === "ai" ? "Agent speaks first" : "You speak first"}
        </span>
      </div>
    </Link>
  );
};

const VoiceAgentPicker = () => (
  <div className="flex h-full w-full flex-col bg-bg">
    <div className="border-b border-line bg-surface px-4 py-3">
      <h1 className="text-heading text-ink">Voice</h1>
      <p className="text-hint text-muted-foreground">
        Choose an agent to start a hands-free call. These are sample agents until your published
        voice agents are listed here.
      </p>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SAMPLE_VOICE_AGENTS.map((agent) => (
          <VoiceAgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
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
