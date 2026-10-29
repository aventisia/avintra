import { DialogContent, DialogDefaultHeader, DialogWrapper } from "@avplatform/ui/dialog";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useAlertDialogStore } from "@avplatform/ui/stores";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useCompanyDetailsDialogStore } from "@/features/05-tenant-admin/tenant/store/company-details/company-details-dialog-store.ee";

import CompanyDetailsForm from "./CompanyDetailsForm";

const CompanyDetailsDialog = ({ children }: React.PropsWithChildren) => {
  const { isOpen, isFormDirty, setOpen } = useCompanyDetailsDialogStore();
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  return (
    <DialogWrapper
      open={isOpen}
      onOpenChangeFn={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () => setOpen(!isOpen),
            alertType: "unsaved",
          });
        }
        // Toggle dialog open state
        else {
          setOpen(!isOpen);
        }
      }}
    >
      {children}
      <DialogContent className="w-full max-w-2xl">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading="Edit billing details"
        />
        <CompanyDetailsForm />
      </DialogContent>
    </DialogWrapper>
  );
};

export default CompanyDetailsDialog;
