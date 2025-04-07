import { useShallow } from "zustand/react/shallow";

import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { DTCrudDialogWrapper } from "@/react-toolkit/ui/data-table/DTCrudDialogWrapper";
import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";

import { getDialogHeadingDescription } from "../../constants";
import { MachineCrudForm } from "./MachineCrudForm";

export const MachineCrudDialog = ({ children }: React.PropsWithChildren) => {
  // Get crud dialog store state
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
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader
          heading={dialogHeaderOptions.heading}
          description={dialogHeaderOptions.description}
        />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          <MachineCrudForm />
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
