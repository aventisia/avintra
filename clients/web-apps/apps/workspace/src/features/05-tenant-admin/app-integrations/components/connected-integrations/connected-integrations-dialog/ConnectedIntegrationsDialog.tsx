import { LinkBreakIcon } from "@phosphor-icons/react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { useConnectedIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/connected-integration-dialog";

import ConnectedIntegrationDialogContent from "./ConnectedIntegrationDialogContent";

const ConnectedIntegrationsDialog = () => {
  const { isOpen, setOpen, integrationInfo } = useConnectedIntegrationsDialogStore();

  const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      mark={
        <span className="inline-grid size-12 shrink-0 place-items-center rounded-lg bg-sunken ring-1 ring-inset ring-line">
          <img src={basePath + integrationInfo.icon} alt="" className="size-6" />
        </span>
      }
      eyebrow="Connected integration"
      title={integrationInfo.name}
      footer={
        <>
          <StatusLine tone="open">Connected</StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton data-autofocus onClick={() => setOpen(false)}>
              Close
            </CardDialogButton>
            <CardDialogButton variant="danger" onClick={() => setOpen(false)}>
              <LinkBreakIcon className="size-4" />
              Disconnect
            </CardDialogButton>
          </div>
        </>
      }
    >
      <ConnectedIntegrationDialogContent description={integrationInfo.description} />
    </CardDialog>
  );
};

export default ConnectedIntegrationsDialog;
