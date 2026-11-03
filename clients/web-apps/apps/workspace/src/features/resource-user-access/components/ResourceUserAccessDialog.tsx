import { ArrowClockwiseIcon, InfoIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { ModeCard } from "../../resource-access-shared/components/parts/ModeCard";
import { PolicySkeleton } from "../../resource-access-shared/components/parts/PolicySkeleton";
import { AccessMode } from "../../resource-access-shared/types/access-mode.type";
import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useResourceUserAccessDraft } from "../hooks/useResourceUserAccessDraft.hook";
import { useResourceUserAccessStore } from "../stores/resource-user-access.store";
import { getResourceDisplayName, getResourceTypeLabel } from "../utils/resource-display.util";
import { ShareMark } from "./user-access-dialog/ShareMark";
import { SharePanels } from "./user-access-dialog/SharePanels";
import { ShareSummary } from "./user-access-dialog/ShareSummary";

type ResourceUserAccessDialogProps = {
  queryKey: unknown[];
  /** Environment-agnostic resources (FlowVersion) can still be shared in PROD. */
  allowInProd?: boolean;
};

const ResourceUserAccessCard = ({ isOpen, queryKey }: { isOpen: boolean; queryKey: unknown[] }) => {
  const draft = useResourceUserAccessDraft(isOpen, queryKey);
  const spaceName = useCurrentSpaceStore((state) => state.currentSpace?.name ?? "Central");
  const resourceName = getResourceDisplayName(draft.resourceName, draft.resourceType);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draft.isLoading || bodyRef.current?.contains(document.activeElement)) return;
    bodyRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [draft.isLoading]);

  const handleModeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next: AccessMode = draft.isOpenAccess ? "restricted" : "open";
    draft.chooseMode(next);
    event.currentTarget.querySelector<HTMLElement>(`[data-mode="${next}"]`)?.focus();
  };

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={draft.close}
      isDismissLocked={draft.isSaving}
      isOutsideClickLocked={draft.isDirty}
      widthClassName="w-[min(35rem,calc(100vw-2rem))]"
      mark={<ShareMark resourceType={draft.resourceType} />}
      eyebrow={`Share ${getResourceTypeLabel(draft.resourceType)}`}
      title={resourceName}
      footer={
        <>
          <ShareSummary draft={draft} spaceName={spaceName} />
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={draft.close} disabled={draft.isSaving}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              disabled={!draft.canSave}
              isBusy={draft.isSaving}
              onClick={draft.save}
            >
              {draft.isSaving ? "Saving" : "Save changes"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <div ref={bodyRef} {...(draft.isSaving ? { inert: "" } : {})} aria-busy={draft.isSaving}>
        {draft.isLoading ? (
          <PolicySkeleton />
        ) : draft.isError ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-bad/35 bg-bad/5 px-6 py-8 text-center">
            <p className="text-[13.5px] font-semibold text-ink">Couldn’t load who has access</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Check your connection and try again.
            </p>
            <CardDialogButton className="mt-3" onClick={draft.retry}>
              <ArrowClockwiseIcon className="size-3.5" />
              Retry
            </CardDialogButton>
          </div>
        ) : (
          <>
            {draft.canShareWithEveryone && (
              <div
                role="radiogroup"
                aria-label={`Who can use ${resourceName}`}
                onKeyDown={handleModeKeyDown}
                className="grid grid-cols-2 gap-3"
              >
                <ModeCard
                  mode="restricted"
                  isChecked={!draft.isOpenAccess}
                  title="Specific people"
                  description="Only people you add can open it."
                  onSelect={draft.chooseMode}
                />
                <ModeCard
                  mode="open"
                  isChecked={draft.isOpenAccess}
                  title="Everyone"
                  description={`Anyone in ${spaceName} can view it.`}
                  onSelect={draft.chooseMode}
                  autoFocusTarget={draft.isOpenAccess}
                />
              </div>
            )}

            <SharePanels draft={draft} spaceName={spaceName} />

            {draft.resourceType === ResourceTypeEnum.Flow && (
              <p className="mt-5 flex gap-2 text-[12px] leading-5 text-muted-foreground">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                Sharing covers every version of this agent. Moving it to a folder doesn’t change who
                has access.
              </p>
            )}
          </>
        )}
      </div>
    </CardDialog>
  );
};

/**
 * Share dialog for the resource selected in the resource share store. Changes are kept as a
 * draft and saved together; each opening starts from a fresh draft.
 */
function ResourceUserAccessDialog({
  queryKey,
  allowInProd = false,
}: ResourceUserAccessDialogProps) {
  const isProd = useEnvironmentStore((state) => state.env === "prod");
  const isProdBlocked = isProd && !allowInProd;
  const { showDialog, setShowDialog } = useResourceUserAccessStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );
  const isOpen = showDialog && !isProdBlocked;
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [openCount, setOpenCount] = useState(isOpen ? 1 : 0);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setOpenCount((count) => count + 1);
  }

  useEffect(() => {
    if (isProdBlocked && showDialog) setShowDialog(false);
  }, [isProdBlocked, setShowDialog, showDialog]);

  if (openCount === 0) return null;

  return <ResourceUserAccessCard key={openCount} isOpen={isOpen} queryKey={queryKey} />;
}

export default ResourceUserAccessDialog;
