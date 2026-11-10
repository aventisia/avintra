import { useDocumentTitle } from "@avplatform/ui/hooks";

import AvailableIntegrations from "./available-integrations/AvailableIntegrations";
import AvailableIntegrationsDialog from "./available-integrations/available-integrations-dialog/AvailableIntegrationsDialog";
import ConnectedIntegrations from "./connected-integrations/ConnectedIntegrations";
import ConnectedIntegrationsDialog from "./connected-integrations/connected-integrations-dialog/ConnectedIntegrationsDialog";

export const AppIntegrations = () => {
  // Set the document title
  useDocumentTitle("Integrations");

  return (
    <>
      <div className="space-y-5 py-4">
        <p className="text-title text-ink">Integrations</p>
        <ConnectedIntegrations />
        <AvailableIntegrationsDialog>
          <AvailableIntegrations />
        </AvailableIntegrationsDialog>
      </div>
      <ConnectedIntegrationsDialog />
    </>
  );
};
