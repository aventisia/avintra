import { DialogPrimitive } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { CircleNotchIcon, InfoIcon, XIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

import { ModeCard } from "../../../resource-access-shared/components/parts/ModeCard";
import { PolicySkeleton } from "../../../resource-access-shared/components/parts/PolicySkeleton";
import { ResourceMark } from "../../../resource-access-shared/components/parts/ResourceMark";
import { MARK_SHADOW } from "../../../resource-access-shared/constants/access-ui.constant";
import { getResourceDisplayName } from "../../../resource-user-access/utils/resource-display.util";
import { useFlowAccessMode } from "../../hooks/useFlowAccessMode.hook";
import type { ResourceFlowDraft } from "../../hooks/useResourceFlowDraft.hook";
import { AccessPanels } from "./parts/AccessPanels";
import { PolicySummary } from "./parts/PolicySummary";

/**
 * Agent access editor for a resource. The open/restricted decision comes first and the
 * allow-list only appears once access is restricted.
 */
export const ResourceFlowAccessContent = ({ draft }: { draft: ResourceFlowDraft }) => {
  const resourceName = getResourceDisplayName(draft.resourceName, draft.resourceType);
  const { mode, chooseMode, canSave, handleModeKeyDown } = useFlowAccessMode(draft);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (draft.isLoading || cardRef.current?.contains(document.activeElement)) return;
    cardRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [draft.isLoading]);

  return (
    <motion.section
      ref={cardRef}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.16 }}
      className="relative flex max-h-[calc(100dvh_-_max(4.5rem,12vh)_-_1rem)] w-[min(35rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg bg-surface text-ink shadow-pop ring-1 ring-line"
    >
      <header className="flex items-start gap-4 px-6 pb-4 pt-6">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-lg border border-line bg-sunken",
            MARK_SHADOW,
          )}
        >
          <ResourceMark resourceType={draft.resourceType} className="size-6" />
        </span>
        <div className="min-w-0 flex-1 mt-1">
          <p className="font-mono text-label uppercase text-muted-foreground">Agent access</p>
          <DialogPrimitive.Title className="truncate text-heading text-ink">
            {resourceName}
          </DialogPrimitive.Title>
        </div>
        <DialogPrimitive.Close
          aria-label="Close"
          className="-mr-2 -mt-1 grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-hover hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-focus"
        >
          <XIcon className="size-4" />
        </DialogPrimitive.Close>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-1">
        {draft.isLoading ? (
          <PolicySkeleton />
        ) : (
          <>
            <div
              role="radiogroup"
              aria-label={`Which agents can use ${resourceName}`}
              onKeyDown={handleModeKeyDown}
              className="grid grid-cols-2 gap-3"
            >
              <ModeCard
                mode="open"
                isChecked={mode === "open"}
                title="Any agent"
                description="Open to every agent in this workspace."
                onSelect={chooseMode}
                autoFocusTarget={mode === "open"}
              />
              <ModeCard
                mode="restricted"
                isChecked={mode === "restricted"}
                title="Selected agents"
                description="Limited to the agents you pick."
                onSelect={chooseMode}
              />
            </div>

            <AccessPanels draft={draft} mode={mode} />

            <p className="mt-5 flex gap-2 text-[12px] leading-5 text-muted-foreground">
              <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              Access applies to every version of an agent, including ones created and published
              later.
            </p>
          </>
        )}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-line bg-sunken px-6 py-3.5">
        <PolicySummary draft={draft} mode={mode} resourceType={draft.resourceType} />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={draft.close}
            className="h-control-md rounded-md px-3.5 text-button text-ink-2 outline-none transition hover:bg-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={draft.save}
            disabled={!canSave}
            className="inline-flex h-control-md items-center gap-2 rounded-md bg-primary px-4 text-button text-primary-foreground outline-none transition hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:bg-fill disabled:text-muted-foreground"
          >
            {draft.isSaving && <CircleNotchIcon className="size-4 animate-spin" />}
            {draft.isSaving ? "Saving" : "Save changes"}
          </button>
        </div>
      </footer>
    </motion.section>
  );
};
