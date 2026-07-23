import { DTCrudDialogWrapper } from "@avplatform/ui/data-table";
import { DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { getDialogHeadingDescription } from "../../constants";
import RoleCrudForm from "./RoleCrudForm";

export const RoleCrudDialog = ({ children }: React.PropsWithChildren) => {
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
      <DialogContent side={"right"} className="!max-w-[40rem]">
        <DialogDefaultHeader
          heading={dialogHeaderOptions.heading}
          description={dialogHeaderOptions.description}
        />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          <RoleCrudForm />
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
