import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { IconTile } from "@avplatform/ui/icon-tile";
import { useAlertDialogStore } from "@avplatform/ui/stores";
import { BuildingsIcon } from "@phosphor-icons/react";
import { useIsMutating } from "@tanstack/react-query";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { updateCompanyDetails } from "@/features/05-tenant-admin/tenant/apis/tenant-info-apis.ee";
import { useCompanyDetailsDialogStore } from "@/features/05-tenant-admin/tenant/store/company-details/company-details-dialog-store.ee";

import CompanyDetailsForm from "./CompanyDetailsForm";

const CompanyDetailsDialog = () => {
  const { isOpen, isFormDirty, setOpen } = useCompanyDetailsDialogStore();
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );
  const isSaving =
    useIsMutating({ predicate: ({ options }) => options.mutationFn === updateCompanyDetails }) > 0;
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
      isDismissLocked={isSaving}
      isOutsideClickLocked={isFormDirty}
      widthClassName="w-[min(40rem,calc(100vw-2rem))]"
      mark={
        <IconTile Icon={BuildingsIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />
      }
      eyebrow="Billing"
      title="Edit billing details"
      footer={
        <>
          <StatusLine tone={isSaving || isFormDirty ? "pending" : "idle"}>
            {isSaving ? "Saving" : isFormDirty ? "Unsaved changes" : "No changes yet"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={handleClose} disabled={isSaving}>
              Cancel
            </CardDialogButton>
            <div ref={setActionsSlot} className="contents" />
          </div>
        </>
      }
    >
      <CompanyDetailsForm actionsSlot={actionsSlot} />
    </CardDialog>
  );
};

export default CompanyDetailsDialog;
