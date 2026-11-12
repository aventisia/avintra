import { CopyableText } from "@avplatform/ui";
import { format, formatDistanceToNowStrict } from "date-fns";
import { type ReactNode } from "react";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { FlowVersionDto } from "../../dtos/flow-version-dto";
import { AuthorChip } from "./AuthorChip";

interface AgentFactsProps {
  versions: FlowVersionDto[] | undefined;
}

/**
 * Who created and last changed the agent, derived from its oldest and newest versions.
 */
export const AgentFacts = ({ versions }: AgentFactsProps) => {
  const currentFlow = useCurrentFlowStore((state) => state.currentFlow);
  const newest = versions?.[0];
  const oldest = versions?.[versions.length - 1];

  const facts: [string, ReactNode][] = [
    [
      "Created",
      oldest?.createdOn ? (
        <span className="flex min-w-0 items-center gap-1.5">
          <AuthorChip version={oldest} />
          <span className="shrink-0 text-muted-foreground">
            {format(new Date(oldest.createdOn), "MMM d, yyyy")}
          </span>
        </span>
      ) : null,
    ],
    [
      "Last change",
      newest?.createdOn ? (
        <span className="flex min-w-0 items-center gap-1.5">
          <AuthorChip version={newest} />
          <span className="shrink-0 text-muted-foreground">
            {formatDistanceToNowStrict(new Date(newest.createdOn), { addSuffix: true })}
          </span>
        </span>
      ) : null,
    ],
    ["Access", currentFlow.accessType],
    [
      "Agent ID",
      <CopyableText
        key="id"
        value={currentFlow.id}
        className="min-w-0"
        textClassName="font-mono text-hint text-ink-2"
      />,
    ],
  ];

  return (
    <dl className="mx-4 mb-4 grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 text-body-sm">
      {facts
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-ink">{value}</dd>
          </div>
        ))}
    </dl>
  );
};
