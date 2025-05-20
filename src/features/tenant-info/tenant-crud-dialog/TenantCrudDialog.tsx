import { DTCrudDialogWrapper } from "@aventisia/ui/data-table";
import { DialogContent, DialogDefaultHeader } from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";

import { TenantCrudForm } from "./TenantCrudForm";

export const TenantCrudDialog = ({ children }: React.PropsWithChildren) => {
  // Return dialog
  return (
    <DTCrudDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[40rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading="Edit Tenant Information"
        />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <TenantCrudForm />
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
