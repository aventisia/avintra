import { DTCrudDialogWrapper } from "@aventisia/ui/data-table";
import { DialogContent, DialogDefaultHeader } from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { getDialogHeadingDescription } from "../../constants";
import { BillingAddressCrudForm } from "./BillingAddressCrudForm";

export const BillingAddressCrudDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Get crud dialog store to show dialog state
  const {
    crudDialogOptions: { crudAction },
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  // Get dialog heading and description
  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

  // Return dialog
  return (
    <DTCrudDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[30rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading={dialogHeaderOptions.heading}
          description={dialogHeaderOptions.description}
        />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <BillingAddressCrudForm />
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
