import { IconTile } from "@avplatform/ui/icon-tile";
import { MonitorIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import {
  AccessEmptyState,
  PanelHeading,
  WarningLine,
} from "@/features/resource-access-shared/components/AccessPanelParts";
import { PANEL_TRANSITION } from "@/features/resource-access-shared/constants/access-ui.constant";
import { pluralize } from "@/utils/pluralize.util";

import { useMachineAssignmentDraft } from "../../hooks/useMachineAssignmentDraft.hook";
import { useAssignMachineStore } from "../../stores/assign-machine-store";
import { AssignedMachineRow } from "./AssignedMachineRow";
import { MachinePicker } from "./MachinePicker";

const DraftStatus = ({
  addedCount,
  removedCount,
  assignedCount,
}: {
  addedCount: number;
  removedCount: number;
  assignedCount: number;
}) => {
  if (addedCount > 0 || removedCount > 0) {
    const changes = [
      addedCount > 0 && `${addedCount} to assign`,
      removedCount > 0 && `${removedCount} to remove`,
    ].filter(Boolean);
    return <StatusLine tone="pending">{changes.join(", ")}</StatusLine>;
  }
  return (
    <StatusLine tone={assignedCount > 0 ? "open" : "idle"}>
      {assignedCount > 0
        ? `${assignedCount} ${pluralize(assignedCount, "machine")} assigned`
        : "No machines assigned"}
    </StatusLine>
  );
};

const MachineAssignmentPanel = ({ isOpen }: { isOpen: boolean }) => {
  const draft = useMachineAssignmentDraft();

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={draft.close}
      isDismissLocked={draft.isSaving}
      isOutsideClickLocked={draft.isDirty}
      widthClassName="w-[min(35rem,calc(100vw-2rem))]"
      mark={<IconTile Icon={MonitorIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow="Assigned machines"
      title={draft.flowName || "Agent"}
      footer={
        <>
          <DraftStatus
            addedCount={draft.addedCount}
            removedCount={draft.removedCount}
            assignedCount={draft.selectedIds.length}
          />
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={draft.close} disabled={draft.isSaving}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              onClick={draft.save}
              disabled={!draft.isDirty}
              isBusy={draft.isSaving}
            >
              {draft.isSaving ? "Saving" : "Save changes"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      {draft.isLoading ? (
        <div className="animate-pulse space-y-5">
          <div className="h-11 rounded-lg bg-muted" />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 rounded bg-muted" />
                <div className="h-2.5 w-1/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pb-1">
          <MachinePicker draft={draft} />
          {draft.removedCount > 0 && (
            <WarningLine>Removed machines can no longer run this agent once you save.</WarningLine>
          )}

          <PanelHeading
            title="Assigned machines"
            count={draft.selectedIds.length}
            action={
              draft.selectedIds.length > 1 && (
                <button
                  type="button"
                  onClick={draft.removeAll}
                  className="text-[12px] font-medium text-muted-foreground transition hover:text-bad"
                >
                  Remove all
                </button>
              )
            }
          />

          {draft.rows.length === 0 ? (
            <AccessEmptyState
              icon={MonitorIcon}
              title="No machines assigned"
              description="Search above and pick the machines that should run this agent."
            />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg bg-surface ring-1 ring-line">
              <AnimatePresence initial={false}>
                {draft.rows.map(({ machine, change }) => (
                  <motion.li
                    key={machine.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={PANEL_TRANSITION}
                    className="overflow-hidden"
                  >
                    <AssignedMachineRow machine={machine} change={change} draft={draft} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      )}
    </CardDialog>
  );
};

/**
 * Dialog editing the machines assigned to an agent version, in the style of the resource
 * agent-access dialog: search to add, remove or undo in place, then save the whole set. Each
 * opening starts from a fresh draft.
 */
const AssignMachinesDialog = () => {
  const isOpen = useAssignMachineStore((state) => state.showDialog);
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [openCount, setOpenCount] = useState(isOpen ? 1 : 0);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setOpenCount((count) => count + 1);
  }

  if (openCount === 0) return null;

  return <MachineAssignmentPanel key={openCount} isOpen={isOpen} />;
};

export default AssignMachinesDialog;
