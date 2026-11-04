import { cn } from "@avplatform/ui/lib";
import { InfoIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";

import { ModeCard } from "../../../resource-access-shared/components/parts/ModeCard";
import { PolicySkeleton } from "../../../resource-access-shared/components/parts/PolicySkeleton";
import { ResourceMark } from "../../../resource-access-shared/components/parts/ResourceMark";
import { MARK_SHADOW } from "../../../resource-access-shared/constants/access-ui.constant";
import { getResourceDisplayName } from "../../../resource-user-access/utils/resource-display.util";
import { useFlowAccessMode } from "../../hooks/useFlowAccessMode.hook";
import type { ResourceFlowDraft } from "../../hooks/useResourceFlowDraft.hook";
import { AccessPanels } from "./parts/AccessPanels";
import { PolicySummary } from "./parts/PolicySummary";

type ResourceFlowAccessContentProps = {
  isOpen: boolean;
  draft: ResourceFlowDraft;
};

/**
 * Agent access editor for a resource. The open/restricted decision comes first and the
 * allow-list only appears once access is restricted.
 */
export const ResourceFlowAccessContent = ({ isOpen, draft }: ResourceFlowAccessContentProps) => {
  const resourceName = getResourceDisplayName(draft.resourceName, draft.resourceType);
  const { mode, chooseMode, canSave, handleModeKeyDown } = useFlowAccessMode(draft);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draft.isLoading || bodyRef.current?.contains(document.activeElement)) return;
    bodyRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [draft.isLoading]);

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={draft.close}
      isDismissLocked={draft.isSaving}
      isOutsideClickLocked={draft.isDirty}
      widthClassName="w-[min(35rem,calc(100vw-2rem))]"
      mark={
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-lg border border-line bg-sunken",
            MARK_SHADOW,
          )}
        >
          <ResourceMark resourceType={draft.resourceType} className="size-6" />
        </span>
      }
      eyebrow="Agent access"
      title={resourceName}
      footer={
        <>
          <PolicySummary draft={draft} mode={mode} resourceType={draft.resourceType} />
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={draft.close} disabled={draft.isSaving}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              onClick={draft.save}
              disabled={!canSave}
              isBusy={draft.isSaving}
            >
              {draft.isSaving ? "Saving" : "Save changes"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <div ref={bodyRef}>
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
    </CardDialog>
  );
};
