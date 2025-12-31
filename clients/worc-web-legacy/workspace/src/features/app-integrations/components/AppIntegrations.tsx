import AvailableIntegrationsDialog from "./available-integrations/available-integrations-dialog/AvailableIntegrationsDialog";
import AvailableIntegrations from "./available-integrations/AvailableIntegrations";
import ConnectedIntegrationsDialog from "./connected-integrations/connected-integrations-dialog/ConnectedIntegrationsDialog";
import ConnectedIntegrations from "./connected-integrations/ConnectedIntegrations";

export const AppIntegrations = () => {
  return (
    <>
      <div className="space-y-5 py-4">
        <p className="text-lg font-medium">Integrations</p>
        <ConnectedIntegrations />
        <AvailableIntegrationsDialog>
          <AvailableIntegrations />
        </AvailableIntegrationsDialog>
      </div>
      <ConnectedIntegrationsDialog />
    </>
  );
};
