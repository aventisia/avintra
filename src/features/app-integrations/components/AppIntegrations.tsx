import AvailableIntegrationsDialog from "./available-integrations/available-integrations-dialog/AvailableIntegrationsDialog";
import AvailableIntegrations from "./available-integrations/AvailableIntegrations";

export const AppIntegrations = () => {
  return (
    <div className="space-y-6 py-4">
      <div>
        <p className="text-lg font-medium">Integrations</p>
        <p className="text-sm text-muted-foreground">
          Supercharge your workflow with our integrations.
        </p>
      </div>
      <AvailableIntegrationsDialog>
        <AvailableIntegrations />
      </AvailableIntegrationsDialog>
    </div>
  );
};
