import { Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { CircleAlert, Link } from "lucide-react";

import { useConnectedIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/connected-integration-dialog";

const ConnectedIntegrationDialogContent = () => {
  const { setOpen } = useConnectedIntegrationsDialogStore();
  return (
    <>
      <div className="space-y-3 px-6 py-4">
        {/* Warning */}
        <div className="flex hidden items-center gap-2 rounded-md bg-bad/10 px-2 py-1.5 text-xs text-bad">
          <CircleAlert className="h-6 w-6" />
          <p>
            Oops! It seems segment is currently not syncing. Please check your connection settings
            or disconnect and reconnect.
          </p>
        </div>
        {/* Connection Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Connection Status:</span>
          <Badge variant="completed">Connected</Badge>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Sync:</span>
          <span>14/02/2025</span>
        </div>

        {/* Date Connected */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Date Connected:</span>
          <span>14/07/2024</span>
        </div>

        {/* Agents Connected */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Agents Connected:</span>
          <span className="text-primary underline">10</span>
        </div>
      </div>
      <Separator />
      <div className="px-6 py-3 text-right">
        <Button variant={"destructive"} onClick={() => setOpen(false)}>
          <Link className="mr-1.5 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    </>
  );
};

export default ConnectedIntegrationDialogContent;
