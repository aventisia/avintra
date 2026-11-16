import { CrudDialogFormContextProvider, useCrudDialogChrome } from "@avplatform/ui/crud-dialog";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useAlertDialogStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import GoogleDriveForm from "@/features/05-tenant-admin/app-integrations/features/google-drive/components/GoogleDriveForm";
import OneDriveForm from "@/features/05-tenant-admin/app-integrations/features/one-drive/components/OneDriveForm";
import OpenAIForm from "@/features/05-tenant-admin/app-integrations/features/open-ai/components/OpenAIForm";
import SendgridForm from "@/features/05-tenant-admin/app-integrations/features/sendgrid/components/SendgridForm";
import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

// import GeminiForm from "@/features/05-tenant-admin/app-integrations/features/gemini/components/GeminiForm";

const FormActionsSlot = () => {
  const chrome = useCrudDialogChrome();

  return <div ref={chrome?.setActionsSlot} className="flex items-center gap-2 [&>button]:h-9" />;
};

const IntegrationCard = () => {
  const { isOpen, setOpen, isFormDirty, integrationInfo } = useAvailableIntegrationsDialogStore();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

  const { showDefaultAlertDialog } = useShowAlertHandler();

  const handleClose = () => {
    if (isAlertDialogOpen) return;

    if (isFormDirty) {
      showDefaultAlertDialog({
        confirmActionFn: () => setOpen(false),
        alertType: "unsaved",
      });
    } else {
      setOpen(false);
    }
  };

  const renderIntegrationForm = () => {
    switch (integrationInfo.value) {
      case "sendgrid":
        return <SendgridForm />;

      case "one_drive":
        return <OneDriveForm />;

      case "openai":
        return <OpenAIForm />;

      // To be integrated later
      // case "gemini":
      //   return <GeminiForm />;

      case "google_drive":
        return <GoogleDriveForm />;

      default:
        return (
          <p className="text-[13px] italic text-muted-foreground">
            Sorry, we don't have integrations for {integrationInfo.name} yet.
          </p>
        );
    }
  };

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={handleClose}
      isOutsideClickLocked={isFormDirty}
      widthClassName="w-[min(36rem,calc(100vw-2rem))]"
      mark={
        <span className="inline-grid size-12 shrink-0 place-items-center rounded-lg bg-sunken ring-1 ring-inset ring-line">
          <img src={basePath + integrationInfo.icon} alt="" className="size-6" />
        </span>
      }
      eyebrow="Connect integration"
      title={integrationInfo.name}
      footer={
        <>
          <StatusLine tone={isFormDirty ? "pending" : "idle"}>
            {isFormDirty ? "Unsaved changes" : "Not connected yet"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={handleClose}>Cancel</CardDialogButton>
            <FormActionsSlot />
          </div>
        </>
      }
    >
      <p className="mb-4 text-[13px] leading-5 text-ink-2">{integrationInfo.description}</p>
      {renderIntegrationForm()}
    </CardDialog>
  );
};

const AvailableIntegrationsDialog = ({ children }: React.PropsWithChildren) => {
  const setOpen = useAvailableIntegrationsDialogStore((state) => state.setOpen);

  return (
    <>
      {children}
      {/* IMPORTANT NOTE: The CRUD dialog context gives the integration forms card-dialog field
      styles and lets their `CrudDialogActions` portal into this footer. */}
      <CrudDialogFormContextProvider onClose={() => setOpen(false)}>
        <IntegrationCard />
      </CrudDialogFormContextProvider>
    </>
  );
};

export default AvailableIntegrationsDialog;
