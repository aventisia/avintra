/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomCheckbox from "@/components/CustomCheckbox";

import { buttonVariants } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  // DialogDefaultHeader,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Tooltip } from "@aventisia/ui/tooltip";
import { X } from "lucide-react";
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
        <div
          className={
            "relative flex items-center justify-between border-b p-3.5 text-lg tracking-wide"
          }
        >
          {/* Left side - Dialog Heading and description */}
          <div className="ml-2 flex flex-col">
            <DialogTitle className="flex items-center font-semibold  text-foreground">
              <span className="truncate w-[35rem]">
                {`Share - ${resourceName ?? "Resource"}`}
              </span>
            </DialogTitle>
          </div>
          {/* Right side - Dialog action buttons */}
          <div className="flex items-center">
            {/* Close Dialog */}
            <Tooltip content={"Close"} shortcut="Esc">
              <DialogClose
                className={buttonVariants({ variant: "ghost", size: "icon8" })}
              >
                <X className="h-5 w-5 text-[--icon-color]" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </Tooltip>
          </div>
        </div>
        {/* <DialogDefaultHeader
          heading={`Share - ${resourceName ?? "Resource"}`}

        /> */}
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
