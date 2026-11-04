import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { IconTile } from "@avplatform/ui/icon-tile";
import { useAlertDialogStore } from "@avplatform/ui/stores";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useIsMutating } from "@tanstack/react-query";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import { exportCreditUsageCSV } from "../../apis/export-service-apis.ee";
import { useExportDialogStore } from "../../store/export-dialog-store.ee";
import ExportDialogForm from "./ExportDialogForm.ee";

const ExportDialog = () => {
  const { isOpen, setOpen, isFormDirty } = useExportDialogStore();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const isExporting =
    useIsMutating({ predicate: ({ options }) => options.mutationFn === exportCreditUsageCSV }) > 0;
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null);

  const handleClose = () => {
    if (isAlertDialogOpen) return;
    if (isFormDirty) {
      showDefaultAlertDialog({ confirmActionFn: () => setOpen(false), alertType: "unsaved" });
    } else {
      setOpen(false);
    }
  };

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={handleClose}
      isDismissLocked={isExporting}
      isOutsideClickLocked={isFormDirty}
      widthClassName="w-[min(36rem,calc(100vw-2rem))]"
      mark={
        <IconTile
          Icon={DownloadSimpleIcon}
          size="lg"
          className="size-12 rounded-lg [&>svg]:size-6"
        />
      }
      eyebrow="Usage"
      title="Export credit usage"
      footer={
        <>
          <StatusLine tone={isExporting ? "pending" : "idle"}>
            {isExporting ? "Preparing CSV" : "Downloads as a CSV file"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={handleClose} disabled={isExporting}>
              Cancel
            </CardDialogButton>
            <div ref={setActionsSlot} className="contents" />
          </div>
        </>
      }
    >
      <ExportDialogForm actionsSlot={actionsSlot} />
    </CardDialog>
  );
};

export default ExportDialog;
