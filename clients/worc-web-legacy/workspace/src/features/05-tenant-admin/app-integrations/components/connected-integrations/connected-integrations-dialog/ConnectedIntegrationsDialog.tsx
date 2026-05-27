import { useConnectedIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/connected-integration-dialog";

import { Separator } from "@aventisia/ui";
import { buttonVariants } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { X } from "lucide-react";

import ConnectedIntegrationDialogContent from "./ConnectedIntegrationDialogContent";

const ConnectedIntegrationsDialog = () => {
  const { isOpen, setOpen, integrationInfo } =
    useConnectedIntegrationsDialogStore();

  const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
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
        <ConnectedIntegrationDialogContent />
      </DialogContent>
    </Dialog>
  );
};

export default ConnectedIntegrationsDialog;
