/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomCheckbox from "@/components/CustomCheckbox";

import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { useResourceShareTenantAccess } from "../hooks/useResourceShareTenantAccess";
import { useResourceShareStore } from "../stores/resource-share-store";
import { SearchUsers } from "./SearchUsers";
import UsersList from "./UsersList";

interface ResourceShareDialogProps {
  queryKey: unknown[];
}

/**
 * Dialog component orchestrating resource sharing.
 * Integrates tenant-wide access toggling and specific user assignment workflows.
 */
function ResourceShareDialog({ queryKey }: ResourceShareDialogProps) {
  const { showDialog, resourceName, setShowDialog } = useResourceShareStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      resourceName: state.resourceName,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Hook to handle tenant wide access, since this property exists in table list
  const {
    assignAllDraft,
    setAssignAllDraft,
    assignAllSaved,
    isMutating,
    handleCommitTenantAccess,
  } = useResourceShareTenantAccess({ queryKey });

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="h-[75vh] min-w-[40rem]">
        <DialogDefaultHeader
          heading={`Share - ${resourceName ?? "Resource"}`}
        />
        <ScrollArea className="h-[calc(75vh-4rem)]">
          <div className="p-4 pb-0">
            <CustomCheckbox
              checked={assignAllDraft}
              label="Share to all team members"
              description="All users in this tenant will be assigned automatically"
              onCheckedChange={setAssignAllDraft}
            />
          </div>

          <SearchUsers
            isTenantAccessDraft={assignAllDraft}
            isTenantAccessSaved={assignAllSaved}
            isMutating={isMutating}
            onCommitTenantAccess={handleCommitTenantAccess}
          />

          {!assignAllSaved && (
            <>
              <p className="text-md font-semibold px-4 mt-2">Shared User(s)</p>
              <div className="p-2 px-4 pb-4">
                <UsersList />
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ResourceShareDialog;
