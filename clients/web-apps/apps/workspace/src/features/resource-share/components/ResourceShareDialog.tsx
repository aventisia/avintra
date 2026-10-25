import { Info, RotateCw } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { useEnvironmentStore } from "@/stores/environment-store";

import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useResourceShareDraft } from "../hooks/useResourceShareDraft.hook";
import { useResourceShareStore } from "../stores/resource-share-store";
import { AccessMode } from "../types/flow-access.type";
import { getResourceDisplayName, getResourceTypeLabel } from "../utils/resource-display.util";
import { ModeCard } from "./resource-flow-access/parts/ModeCard";
import { PolicySkeleton } from "./resource-flow-access/parts/PolicySkeleton";
import { ShareMark } from "./share-dialog/ShareMark";
import { SharePanels } from "./share-dialog/SharePanels";
import { ShareSummary } from "./share-dialog/ShareSummary";

type ResourceShareDialogProps = {
  queryKey: unknown[];
};

const ResourceShareCard = ({ isOpen, queryKey }: { isOpen: boolean; queryKey: unknown[] }) => {
  const draft = useResourceShareDraft(isOpen, queryKey);
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
          <div className="flex flex-col items-center rounded-xl border border-dashed border-rose-200 bg-rose-50/40 px-6 py-8 text-center">
            <p className="text-[13.5px] font-semibold text-slate-800">
              Couldn’t load who has access
            </p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Check your connection and try again.
            </p>
            <CardDialogButton className="mt-3" onClick={draft.retry}>
              <RotateCw className="size-3.5" />
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
                <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
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
function ResourceShareDialog({ queryKey }: ResourceShareDialogProps) {
  const isProd = useEnvironmentStore((state) => state.env === "prod");
  const { showDialog, setShowDialog } = useResourceShareStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );
  const isOpen = showDialog && !isProd;
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [openCount, setOpenCount] = useState(isOpen ? 1 : 0);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setOpenCount((count) => count + 1);
  }

  useEffect(() => {
    if (isProd && showDialog) setShowDialog(false);
  }, [isProd, setShowDialog, showDialog]);

  if (openCount === 0) return null;

  return <ResourceShareCard key={openCount} isOpen={isOpen} queryKey={queryKey} />;
}

export default ResourceShareDialog;
