import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import CustomCheckbox from "@/components/CustomCheckbox";
import { useEnvironmentStore } from "@/stores/environment-store";

import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useResourceShareTenantAccess } from "../hooks/useResourceShareTenantAccess";
import { useResourceShareStore } from "../stores/resource-share-store";
import { SearchUsers } from "./SearchUsers";
import UsersList from "./UsersList";

interface ResourceShareDialogProps {
  queryKey: unknown[];
  /** Environment-agnostic resources (FlowVersion) can still be shared in PROD. */
  allowInProd?: boolean;
}

/**
 * Dialog component orchestrating resource sharing.
 * Integrates tenant-wide access toggling and specific user assignment workflows.
 */
function ResourceShareDialog({ queryKey, allowInProd = false }: ResourceShareDialogProps) {
  const isProdBlocked = useEnvironmentStore((state) => state.env === "prod") && !allowInProd;
  const { showDialog, resourceName, resourceType, setShowDialog } = useResourceShareStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      resourceName: state.resourceName,
      resourceType: state.resourceType,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Close an already-open share dialog if the user switches into PROD.
  useEffect(() => {
    if (isProdBlocked && showDialog) {
      setShowDialog(false);
    }
  }, [isProdBlocked, setShowDialog, showDialog]);

  // Space resources don't support tenant-wide assignment, so hide the
  // "Share to all team members" checkbox for them.
  const isSpaceResource = resourceType === ResourceTypeEnum.Space;

  // Hook to handle tenant wide access, since this property exists in table list
  const {
    assignAllDraft,
    setAssignAllDraft,
    assignAllSaved,
    isMutating,
    handleCommitTenantAccess,
  } = useResourceShareTenantAccess({ queryKey });

  return (
    <Dialog
      open={showDialog && !isProdBlocked}
      onOpenChange={(open) => setShowDialog(isProdBlocked ? false : open)}
    >
      <DialogContent className="flex max-h-[75vh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0">
        <DialogDefaultHeader
          heading={`Share - ${resourceName ?? "Resource"}`}
          description="Choose who can access this resource."
        />
        <ScrollArea className="flex-1">
          {!isSpaceResource && (
            <div className="px-5 pt-4">
              <CustomCheckbox
                checked={assignAllDraft}
                label="Share to all team members"
                description="All users in this tenant will be assigned automatically"
                onCheckedChange={setAssignAllDraft}
              />
            </div>
          )}

          <div className="border-b bg-muted/40 px-5 py-4">
            <SearchUsers
              isTenantAccessDraft={assignAllDraft}
              isTenantAccessSaved={assignAllSaved}
              isMutating={isMutating}
              onCommitTenantAccess={handleCommitTenantAccess}
            />
          </div>

          {!assignAllSaved && (
            <div className="px-5 py-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Shared users</h3>
              <UsersList />
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ResourceShareDialog;
