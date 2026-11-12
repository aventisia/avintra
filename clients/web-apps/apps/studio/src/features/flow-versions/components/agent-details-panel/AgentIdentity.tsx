import { AutosizeTextarea, LoadingSpinner } from "@avplatform/ui";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { MetaLine } from "@avplatform/ui/meta-line";
import { ChatsCircleIcon, CubeIcon, LightningIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUpdateAgentNameMutation } from "@/hooks/useUpdateAgentNameMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { FLOW_TYPE_LABELS } from "../../constants";
import { useFlowsVersionsStore } from "../../stores/flow-versions-store";

const FLOW_TYPE_ICONS = {
  [FlowTypesEnum.Agent]: LightningIcon,
  [FlowTypesEnum.ChatAgent]: ChatsCircleIcon,
  [FlowTypesEnum.Block]: CubeIcon,
};

const INLINE_FIELD_CLASS =
  "w-full rounded-md border border-transparent bg-transparent px-1.5 transition-colors hover:border-line focus-visible:border-focus focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28]";

/**
 * Editable agent name and description with the agent's type and status.
 */
export const AgentIdentity = () => {
  const { currentFlow, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );
  const isPublished = useReactFlowExtStore((state) => state.isPublished);
  const versionNumber = useFlowsVersionsStore((state) => state.versionNumber);
  const { mutate: updateAgent, isPending } = useUpdateAgentNameMutation();

  const [name, setName] = useState(currentFlow.name);
  const [description, setDescription] = useState(currentFlow.description ?? "");
  const isCancellingRef = useRef(false);

  useEffect(() => setName(currentFlow.name), [currentFlow.name]);
  useEffect(() => setDescription(currentFlow.description ?? ""), [currentFlow.description]);

  const save = (patch: { name?: string; description?: string }) => {
    const previous = currentFlow;
    const next = { ...currentFlow, ...patch };
    setCurrentFlow(next);
    updateAgent(
      { id: next.id, type: next.type, name: next.name, description: next.description },
      { onError: () => setCurrentFlow(previous) },
    );
  };

  const commitName = () => {
    const trimmed = name.trim();
    if (isCancellingRef.current || !trimmed) {
      isCancellingRef.current = false;
      setName(currentFlow.name);
      return;
    }
    if (trimmed !== currentFlow.name) save({ name: trimmed });
  };

  const commitDescription = () => {
    if (isCancellingRef.current) {
      isCancellingRef.current = false;
      setDescription(currentFlow.description ?? "");
      return;
    }
    const trimmed = description.trim();
    if (trimmed !== (currentFlow.description ?? "")) save({ description: trimmed });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      isCancellingRef.current = true;
      e.currentTarget.blur();
    } else if (
      e.key === "Enter" &&
      (e.currentTarget.tagName === "INPUT" || e.metaKey || e.ctrlKey)
    ) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const TypeIcon = FLOW_TYPE_ICONS[currentFlow.type] ?? LightningIcon;

  return (
    <section className="px-3 pb-4 pt-4">
      <div className="flex items-start gap-2.5 pl-1">
        <IconTile
          Icon={TypeIcon}
          size="xl"
          className="bg-primary/10 text-primary-text ring-primary/20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <input
              aria-label="Agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={handleKeyDown}
              className={cn(
                INLINE_FIELD_CLASS,
                "py-0.5 text-[17px] font-semibold leading-6 text-ink",
              )}
            />
            {isPending ? (
              <LoadingSpinner className="size-3.5 shrink-0 text-muted-foreground" />
            ) : null}
          </div>
          <MetaLine
            className="px-1.5 text-hint text-muted-foreground"
            items={[
              FLOW_TYPE_LABELS[currentFlow.type],
              versionNumber != null && `Version ${versionNumber}`,
              isPublished ? <span className="font-medium text-ok">Published</span> : "Draft",
            ]}
          />
        </div>
      </div>
      <AutosizeTextarea
        aria-label="Agent description"
        placeholder="Add a description: what this agent does and when it runs"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={commitDescription}
        onKeyDown={handleKeyDown}
        minHeight={36}
        maxHeight={160}
        size="sm"
        className={cn(INLINE_FIELD_CLASS, "mt-3 py-1.5 text-body-sm text-ink-2")}
      />
    </section>
  );
};
