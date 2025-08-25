import AvailableIntegrationsDialog from "./available-integrations/available-integrations-dialog/AvailableIntegrationsDialog";
import AvailableIntegrations from "./available-integrations/AvailableIntegrations";
import ConnectedIntegrationsDialog from "./connected-integrations/connected-integrations-dialog/ConnectedIntegrationsDialog";
import ConnectedIntegrations from "./connected-integrations/ConnectedIntegrations";

export const AppIntegrations = () => {
  return (
    <>
      <div className="space-y-6 py-4">
        <div>
          <p className="text-lg font-medium">Integrations</p>
          <p className="text-sm text-muted-foreground">
            Supercharge your workflow with our integrations.
          </p>
        </div>
        <ConnectedIntegrations />
        <AvailableIntegrationsDialog>
          <AvailableIntegrations />
        </AvailableIntegrationsDialog>
      </div>
      <ConnectedIntegrationsDialog />
    </>
  );
};
