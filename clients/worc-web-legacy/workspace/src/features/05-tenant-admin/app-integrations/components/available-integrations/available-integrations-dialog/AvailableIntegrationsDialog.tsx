import GoogleDriveForm from "@/features/05-tenant-admin/app-integrations/features/google-drive/components/GoogleDriveForm";
import OneDriveForm from "@/features/05-tenant-admin/app-integrations/features/one-drive/components/OneDriveForm";
import OpenAIForm from "@/features/05-tenant-admin/app-integrations/features/open-ai/components/OpenAIForm";
import SendgridForm from "@/features/05-tenant-admin/app-integrations/features/sendgrid/components/SendgridForm";
import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { Separator } from "@aventisia/ui";
import { buttonVariants } from "@aventisia/ui/buttons";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

// import GeminiForm from "@/features/05-tenant-admin/app-integrations/features/gemini/components/GeminiForm";

const AvailableIntegrationsDialog = ({ children }: React.PropsWithChildren) => {
  const { isOpen, setOpen, isFormDirty, integrationInfo } =
    useAvailableIntegrationsDialogStore();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  const basePath = import.meta.env.VITE_WORC_PATH.replace(/\/$/, "");

  const { showDefaultAlertDialog } = useShowAlertHandler();

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
          <div className="h-28 p-6">
            <p className="text-md italic text-muted-foreground">
              Sorry, we don't have integrations for {integrationInfo.name} yet.
            </p>
          </div>
        );
    }
  };

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
      <DialogContent className="w-full max-w-[38rem]">
        <DialogHeader className="px-6 py-4 pb-2">
          <DialogTitle className="justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-accent p-2">
                <img
                  src={basePath + integrationInfo.icon}
                  alt={integrationInfo.name}
                  className="h-6 w-6"
                />
              </div>
              <p>{integrationInfo.name}</p>
            </div>

            <DialogPrimitive.Close
              className={buttonVariants({ variant: "ghost", size: "icon8" })}
            >
              <X className="h-5 w-5 text-[--icon-color]" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogTitle>

          <DialogDescription className="pr-4">
            {integrationInfo.description}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        {renderIntegrationForm()}
      </DialogContent>
    </DialogWrapper>
  );
};

export default AvailableIntegrationsDialog;
