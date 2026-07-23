import { Button } from "@avplatform/ui/buttons";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@avplatform/ui/cards";

import { connectedIntegrations } from "../../constants/connected-integrations";
import { ConnectedIntegrationListDTO } from "../../dto/connected-integration-list-dto";
import { useConnectedIntegrationsDialogStore } from "../../store/connected-integration-dialog";

const ConnectedIntegrations = () => {
  const { setIntegrationInfo, setOpen } = useConnectedIntegrationsDialogStore();

  const handleOpenIntegrationsDialog = (integrationInfo: ConnectedIntegrationListDTO) => {
    setOpen(true);
    setIntegrationInfo(integrationInfo);
  };
  const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "");

  return (
    <div className="space-y-2">
      <p className="px-1 text-lg font-normal">Connected</p>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {connectedIntegrations.map((item) => {
          return (
            <Card className="p-4 hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 p-0">
                <div className="rounded-lg bg-accent p-2">
                  <img src={basePath + item.icon} alt={item.name} className="h-6 w-6" />
                </div>
                <CardTitle className="!mt-0 text-base capitalize">{item.name}</CardTitle>
              </CardHeader>

              <CardDescription className="mt-3 line-clamp-2">{item.description}</CardDescription>

              <CardFooter className="mt-2 justify-end p-0">
                <Button
                  variant={"ghost"}
                  className="bg-transparent font-normal text-primary"
                  onClick={() => handleOpenIntegrationsDialog(item)}
                  disabled={item.disabled}
                >
                  View Integration
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectedIntegrations;
